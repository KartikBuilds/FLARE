"""Scores the detector registry against contracts/benchmarks/*/ground-truth.json.
Each detector directory has vulnerable.sol / corrected.sol / safe-negative.sol /
false-positive.sol and a ground-truth.json saying which ones that detector
should (and shouldn't) fire on. See docs/BENCHMARK_METHODOLOGY.md."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

from app.core.compiler import CompileError, compile_check
from app.core.slither_service import SlitherAnalysisError, run_slither
from app.detectors.registry import run_all_detectors


@dataclass
class CaseResult:
    detector_id: str
    case_file: str
    expected: bool
    actual: bool
    error: str | None = None

    @property
    def outcome(self) -> str:
        if self.error:
            return "error"
        if self.expected and self.actual:
            return "true_positive"
        if not self.expected and not self.actual:
            return "true_negative"
        if self.expected and not self.actual:
            return "false_negative"
        return "false_positive"


@dataclass
class BenchmarkReport:
    cases: list[CaseResult] = field(default_factory=list)

    @property
    def precision(self) -> float | None:
        tp = sum(1 for c in self.cases if c.outcome == "true_positive")
        fp = sum(1 for c in self.cases if c.outcome == "false_positive")
        return tp / (tp + fp) if (tp + fp) else None

    @property
    def recall(self) -> float | None:
        tp = sum(1 for c in self.cases if c.outcome == "true_positive")
        fn = sum(1 for c in self.cases if c.outcome == "false_negative")
        return tp / (tp + fn) if (tp + fn) else None

    def to_dict(self) -> dict:
        return {
            "precision": self.precision,
            "recall": self.recall,
            "total_cases": len(self.cases),
            "true_positives": sum(1 for c in self.cases if c.outcome == "true_positive"),
            "true_negatives": sum(1 for c in self.cases if c.outcome == "true_negative"),
            "false_positives": sum(1 for c in self.cases if c.outcome == "false_positive"),
            "false_negatives": sum(1 for c in self.cases if c.outcome == "false_negative"),
            "errors": sum(1 for c in self.cases if c.outcome == "error"),
            "cases": [
                {
                    "detector_id": c.detector_id,
                    "case_file": c.case_file,
                    "expected": c.expected,
                    "actual": c.actual,
                    "outcome": c.outcome,
                    "error": c.error,
                }
                for c in self.cases
            ],
        }


def run_case(sol_file: Path, detector_id: str) -> tuple[bool, str | None]:
    try:
        compile_check([sol_file])
        ir = run_slither([sol_file], "0.8.24")
        findings = run_all_detectors(ir, [sol_file])
        return any(f.detector_id == detector_id for f in findings), None
    except (CompileError, SlitherAnalysisError) as exc:
        return False, str(exc)


def run_benchmark(benchmarks_dir: Path) -> BenchmarkReport:
    report = BenchmarkReport()
    for detector_dir in sorted(benchmarks_dir.iterdir()):
        gt_path = detector_dir / "ground-truth.json"
        if not gt_path.exists():
            continue
        ground_truth = json.loads(gt_path.read_text())
        detector_id = ground_truth["detector_id"]
        for case_file, expectation in ground_truth["cases"].items():
            sol_path = detector_dir / case_file
            actual, error = run_case(sol_path, detector_id)
            report.cases.append(
                CaseResult(
                    detector_id=detector_id,
                    case_file=f"{detector_dir.name}/{case_file}",
                    expected=expectation["expect_finding"],
                    actual=actual,
                    error=error,
                )
            )
    return report


if __name__ == "__main__":
    import sys

    benchmarks_root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/srv/contracts/benchmarks")
    result = run_benchmark(benchmarks_root)
    output = json.dumps(result.to_dict(), indent=2)
    print(output)

    out_path = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("/srv/evaluation/benchmark-result.json")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(output)
