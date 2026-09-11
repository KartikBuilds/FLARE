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


@dataclass
class HoldoutCaseResult:
    case: str
    expected: bool
    actual: bool | None
    finding_count: int
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
class HoldoutReport:
    cases: list[HoldoutCaseResult] = field(default_factory=list)

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
            "suite": "holdout",
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
                    "case": c.case,
                    "expected": c.expected,
                    "actual": c.actual,
                    "finding_count": c.finding_count,
                    "outcome": c.outcome,
                    "error": c.error,
                }
                for c in self.cases
            ],
        }


def run_holdout_case(sol_files: list[Path]) -> tuple[bool, int, str | None]:
    """Compiles and analyzes every file in a holdout case and reports
    whether the full detector registry produced any finding at all —
    holdout ground truth is per-case ("should this project produce a
    finding"), not per-detector like the dev-set fixtures.

    Multi-file cases are analyzed one file at a time and their findings
    unioned, rather than passed to Slither together. This was a real,
    discovered-by-this-benchmark limitation, not a design choice: Slither's
    "solc" platform target validation (`crytic_compile/platform/solc.py::
    is_supported`) only accepts a single existing file path — a
    comma-joined multi-file string is silently treated as one nonexistent
    filename ("<a>,<b> does not exist"), and a directory is explicitly
    rejected too unless it contains a recognized framework config
    (foundry.toml, hardhat.config.js). Per-file analysis is exactly correct
    for this holdout set's multi-contract cases (the companion files
    intentionally don't `import` each other — each just restates the
    other's ABI as a local interface, the same pattern a real two-contract
    system not built with a monorepo/framework config would need anyway).
    It does *not* fix genuine cross-file `import`-based multi-contract
    analysis in the live pipeline — see docs/LIMITATIONS.md."""
    all_findings = []
    for sol_file in sol_files:
        try:
            compile_check([sol_file])
            ir = run_slither([sol_file], "0.8.24")
            all_findings.extend(run_all_detectors(ir, [sol_file]))
        except (CompileError, SlitherAnalysisError) as exc:
            return False, 0, str(exc)
    return len(all_findings) > 0, len(all_findings), None


def run_holdout_benchmark(holdout_dir: Path) -> HoldoutReport:
    ground_truth = json.loads((holdout_dir / "ground-truth.json").read_text())
    report = HoldoutReport()
    for case_name, case in ground_truth["cases"].items():
        case_dir = holdout_dir / case_name
        sol_files = [case_dir / f for f in case["files"]]
        actual, finding_count, error = run_holdout_case(sol_files)
        report.cases.append(
            HoldoutCaseResult(
                case=case_name,
                expected=case["expect_any_finding"],
                actual=None if error else actual,
                finding_count=finding_count,
                error=error,
            )
        )
    return report


if __name__ == "__main__":
    import sys

    suite = "dev"
    args = sys.argv[1:]
    if args and args[0] in ("dev", "holdout"):
        suite = args[0]
        args = args[1:]

    if suite == "holdout":
        holdout_root = Path(args[0]) if args else Path("/srv/contracts/holdout")
        holdout_report = run_holdout_benchmark(holdout_root)
        output = json.dumps(holdout_report.to_dict(), indent=2)
        print(output)
        out_path = Path(args[1]) if len(args) > 1 else Path("/srv/evaluation/holdout-result.json")
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(output)
    else:
        benchmarks_root = Path(args[0]) if args else Path("/srv/contracts/benchmarks")
        result = run_benchmark(benchmarks_root)
        output = json.dumps(result.to_dict(), indent=2)
        print(output)
        out_path = Path(args[1]) if len(args) > 1 else Path("/srv/evaluation/benchmark-result.json")
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(output)
