"""CI check: a phase branch cannot merge without a passing gate review file."""

from scripts.check_gate import gate_status


def test_pass(tmp_path):
    (tmp_path / "phase-2-gate.md").write_text("# Gate\nReviewer: QA (opus)\nVerdict: PASS\n")
    assert gate_status(tmp_path, "phase-2") == (True, "PASS")


def test_fail_verdict(tmp_path):
    (tmp_path / "phase-2-gate.md").write_text("Verdict: FAIL\n")
    ok, reason = gate_status(tmp_path, "phase-2")
    assert not ok and "FAIL" in reason


def test_missing_file(tmp_path):
    ok, reason = gate_status(tmp_path, "phase-2")
    assert not ok and "missing" in reason


def test_missing_verdict_line(tmp_path):
    (tmp_path / "phase-2-gate.md").write_text("looks fine to me\n")
    ok, reason = gate_status(tmp_path, "phase-2")
    assert not ok and "Verdict" in reason


def test_missing_reviewer_line(tmp_path):
    (tmp_path / "phase-2-gate.md").write_text("Verdict: PASS\n")
    ok, reason = gate_status(tmp_path, "phase-2")
    assert not ok and "Reviewer" in reason


def test_non_phase_branch_not_gated(tmp_path):
    assert gate_status(tmp_path, "docs-typo") == (True, "not a phase branch")
