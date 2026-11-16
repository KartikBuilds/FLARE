"""Run one scan: input checks, compiler, Slither in a killable child process."""

import importlib.metadata
import json
import subprocess
import sys
import tempfile
from pathlib import Path

from flare.compiler import ensure_solc, installable_versions, resolve_solc_version
from flare.errors import FlareError
from flare.mapping import DETECTOR_MAP
from flare.models import AnalyzerRun, Finding, ScanResult
from flare.source import load_source

NOT_CHECKED = [
    "Custom FLARE fund-lock detectors (Phase 2)",
    "Contracts reached through imports or external addresses",
    "Runtime behavior (FLARE does not execute code)",
]


def _slither_version() -> str:
    return importlib.metadata.version("slither-analyzer")


def _finding(result: dict) -> Finding:
    category, severity = DETECTOR_MAP[result["check"]]
    lines: list[int] = []
    for element in result.get("elements", []):
        lines = element.get("source_mapping", {}).get("lines") or []
        if lines:
            break
    return Finding(
        detector=result["check"],
        analyzer="slither",
        category=category,
        severity=severity,
        confidence=result.get("confidence", ""),
        line_start=min(lines) if lines else None,
        line_end=max(lines) if lines else None,
        description=" ".join(result.get("description", "").split()),
    )


def run_scan(path: Path, timeout_s: float = 30.0) -> ScanResult:
    path = Path(path)
    result = ScanResult(status="failed", source_name=path.name, source_sha256=None, size_bytes=None,
                        line_count=None, compiler=None, analyzers=[], findings=[], error=None,
                        not_checked=list(NOT_CHECKED))
    try:
        source = load_source(path)
        result.source_sha256, result.size_bytes, result.line_count = (
            source.sha256, source.size_bytes, source.line_count)
        version = resolve_solc_version(source.pragma, installable_versions())
        solc_path = ensure_solc(version)
        result.compiler = version
    except FlareError as exc:
        result.error = {"code": exc.code, "message": exc.message}
        return result

    # Analyze a private copy so analyzer artifacts never land next to the user's file.
    with tempfile.TemporaryDirectory(prefix="flare-") as work:
        target = Path(work) / source.name
        target.write_text(source.text, encoding="utf-8")
        try:
            proc = subprocess.run(
                [sys.executable, "-m", "flare.worker", str(target), str(solc_path)],
                cwd=work, capture_output=True, text=True, timeout=timeout_s,
            )
        except subprocess.TimeoutExpired:
            result.status = "incomplete"
            result.analyzers = [AnalyzerRun("slither", _slither_version(), "timed_out")]
            result.error = {"code": "TIMEOUT", "message": f"Analysis did not finish within {timeout_s:g} s."}
            return result

    try:
        payload = json.loads(proc.stdout.strip().splitlines()[-1])
    except (IndexError, json.JSONDecodeError):
        payload = {"ok": False, "code": "ANALYZER_FAILED", "message": "The analyzer stopped unexpectedly."}

    if not payload.get("ok"):
        result.analyzers = [AnalyzerRun("slither", _slither_version(), "failed")]
        result.error = {"code": payload.get("code", "ANALYZER_FAILED"), "message": payload.get("message", "")}
        return result

    result.analyzers = [AnalyzerRun("slither", payload["slither_version"], "completed")]
    result.findings = [_finding(r) for r in payload["detectors"] if r.get("check") in DETECTOR_MAP]
    result.status = "complete"
    return result
