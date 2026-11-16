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
    assert "Syntax error" in msg and "line 3" in msg


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


# --- Fable QA gate, finding I-1: solc's message line can carry source text ---

def test_string_literal_never_in_compile_error(tmp_path):
    r = _scan(tmp_path, 'contract A { uint x = "TOPSECRET literal"; }')
    assert r.error["code"] == "COMPILE_FAILED"
    assert "TOPSECRET" not in r.error["message"]
    assert "Type mismatch" in r.error["message"]


def test_identifier_never_in_compile_error(tmp_path):
    r = _scan(tmp_path, "contract A { struct S { uint a; } function f(S memory s) public pure "
                        "returns (uint) { return s.mySecretMember; } }")
    assert r.error["code"] == "COMPILE_FAILED"
    assert "mySecretMember" not in r.error["message"]


def test_line_number_is_the_errors_not_a_warnings():
    from flare.worker import compile_reason
    text = ("Warning: Function state mutability can be restricted to pure\n --> C.sol:4:3:\n  |\n"
            "4 |   function g() public returns (uint) { return 1; }\n"
            "Error: Expected ';' but got '}'\n --> C.sol:8:36:\n  |\n8 |   uint x = 1 }\n")
    assert compile_reason(text).endswith("(line 8)")


# --- Fable QA gate round 2: allow-list, no compiler text reaches the user ---

def _scan_v(tmp_path, pragma, body):
    p = tmp_path / "C.sol"
    p.write_text(f"pragma solidity {pragma};\n{body}\n")
    return run_scan(p)


def test_escaped_quote_does_not_leak(tmp_path):
    r = _scan(tmp_path, 'contract A { uint x = "abc\\"SECRET TEXT HERE"; }')
    assert r.error["code"] == "COMPILE_FAILED" and "SECRET" not in r.error["message"]


def test_long_prefix_with_fake_error_does_not_leak(tmp_path):
    lit = "a" * 190 + " MyError: SECRET AFTER LONG PREFIX"
    r = _scan(tmp_path, f'contract A {{ uint x = "{lit}"; }}')
    assert r.error["code"] == "COMPILE_FAILED" and "SECRET" not in r.error["message"]


@pytest.mark.parametrize("pragma", ["0.4.26", "0.5.17"])
def test_old_compiler_excerpt_does_not_leak(tmp_path, pragma):
    lit = "b" * 150 + ' MyError: OLD EXCERPT SECRET'
    r = _scan_v(tmp_path, pragma, f'contract A {{ uint x = "{lit}"; }}')
    assert r.error["code"] == "COMPILE_FAILED"
    assert "SECRET" not in r.error["message"] and "line 2" in r.error["message"]


def test_unknown_error_falls_back_to_generic_text():
    from flare.worker import compile_reason
    text = "Error: Some brand new solc message with SECRET_IDENT in it\n --> C.sol:7:1:\n"
    out = compile_reason(text)
    assert "SECRET_IDENT" not in out and out.endswith("(line 7)")
