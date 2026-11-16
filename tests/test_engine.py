from pathlib import Path

import pytest

from flare.engine import run_scan

FIX = Path(__file__).parent / "fixtures"
pytestmark = pytest.mark.slither


def test_locked_ether_found():
    r = run_scan(FIX / "locked_ether.sol")
    assert r.status == "complete", r.error
    assert len(r.findings) == 1
    f = r.findings[0]
    assert (f.detector, f.category, f.severity) == ("locked-ether", "Missing Recovery", "High")
    assert f.line_start is not None and f.line_start >= 5
    assert r.compiler and r.compiler.startswith("0.8.")
    assert r.analyzers[0].name == "slither" and r.analyzers[0].status == "completed"


def test_safe_vault_no_findings():
    r = run_scan(FIX / "safe_vault.sol")
    assert r.status == "complete" and r.findings == []
    assert r.overall_level() == "None found"


def test_compile_failure_reported():
    r = run_scan(FIX / "does_not_compile.sol")
    assert r.status == "failed" and r.error["code"] == "COMPILE_FAILED"
    assert "Traceback" not in r.error["message"]
    assert r.analyzers[0].status == "failed"


def test_timeout_incomplete():
    r = run_scan(FIX / "safe_vault.sol", timeout_s=0.01)
    assert r.status == "incomplete" and r.error["code"] == "TIMEOUT"
    assert r.analyzers[0].status == "timed_out" and r.overall_level() is None


def test_import_fails_before_analysis(tmp_path):
    p = tmp_path / "Imp.sol"
    p.write_text('pragma solidity ^0.8.0;\nimport "./B.sol";\ncontract A {}\n')
    r = run_scan(p)
    assert r.status == "failed" and r.error["code"] == "UNRESOLVED_IMPORT" and r.analyzers == []


def test_not_checked_always_listed():
    r = run_scan(FIX / "safe_vault.sol")
    assert any("Runtime behavior" in item for item in r.not_checked)
