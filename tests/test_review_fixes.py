"""Regression tests for the Phase 0-1 independent review findings."""

import json

import pytest

import flare.worker as worker
from flare.engine import run_scan
from flare.mapping import DETECTOR_MAP

pytestmark = pytest.mark.slither


def _scan(tmp_path, body):
    p = tmp_path / "C.sol"
    p.write_text("pragma solidity ^0.8.0;\n" + body + "\n")
    return run_scan(p)


def test_compile_error_never_quotes_source(tmp_path):
    r = _scan(tmp_path, "contract A { function f() public { SecretError: uint x = 1; } }")
    assert r.error["code"] == "COMPILE_FAILED"
    assert "uint x" not in r.error["message"] and "SecretError" not in r.error["message"]


def test_compile_error_gives_reason_and_line(tmp_path):
    r = _scan(tmp_path, "contract A {\n  function f() public { uint x = 1 }\n}")
    msg = r.error["message"]
    assert r.error["code"] == "COMPILE_FAILED"
    assert "Expected ';'" in msg and "line 3" in msg


def test_missing_detector_fails_instead_of_clean(tmp_path, monkeypatch, capsys):
    monkeypatch.setattr(worker, "DETECTOR_MAP", {"no-such-detector": ("Missing Recovery", "High")})
    src = tmp_path / "C.sol"
    src.write_text("pragma solidity ^0.8.0;\ncontract A { function f() external payable {} }\n")
    from flare.compiler import ensure_solc
    worker.main([str(src), str(ensure_solc("0.8.24"))])
    out = json.loads(capsys.readouterr().out.strip().splitlines()[-1])
    assert out["ok"] is False and out["code"] == "ANALYZER_FAILED"


def test_every_mapped_detector_exists_in_slither():
    from slither.detectors import all_detectors
    from slither.detectors.abstract_detector import AbstractDetector
    names = {c.ARGUMENT for c in vars(all_detectors).values()
             if isinstance(c, type) and issubclass(c, AbstractDetector)}
    assert set(DETECTOR_MAP) <= names
