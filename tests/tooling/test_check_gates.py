from pathlib import Path

from scripts.check_gates import REQUIRED_GATES, check_phase


def gate(d: Path, name: str, verdict="PASS", model="opus"):
    (d / f"{name}.md").write_text(f"Verdict: {verdict}\nModel: {model}\n\n## Evidence\nran tests\n")


def setup(tmp_path, phase="phase-2", build_model="sonnet"):
    d = tmp_path / phase
    d.mkdir()
    (d / "BUILD.md").write_text(f"Model: {build_model}\n")
    return d


def test_all_gates_pass(tmp_path):
    d = setup(tmp_path)
    for g in REQUIRED_GATES["phase-2"]:
        gate(d, g, model="human" if g == "owner" else "opus")
    assert check_phase(d, "phase-2") == []


def test_missing_gate_reported(tmp_path):
    d = setup(tmp_path)
    assert any("qa.md missing" in p for p in check_phase(d, "phase-2"))


def test_fail_verdict_blocks(tmp_path):
    d = setup(tmp_path)
    for g in REQUIRED_GATES["phase-2"]:
        gate(d, g, verdict="FAIL" if g == "qa" else "PASS", model="human" if g == "owner" else "opus")
    assert any("qa.md verdict is not PASS" in p for p in check_phase(d, "phase-2"))


def test_reviewer_same_model_as_builder_blocks(tmp_path):
    d = setup(tmp_path, build_model="opus")
    for g in REQUIRED_GATES["phase-2"]:
        gate(d, g, model="human" if g == "owner" else "opus")
    assert any("same model as the builder" in p for p in check_phase(d, "phase-2"))


def test_owner_gate_must_be_human(tmp_path):
    d = setup(tmp_path)
    for g in REQUIRED_GATES["phase-2"]:
        gate(d, g, model="opus")
    assert any("owner.md must be signed by the human owner" in p for p in check_phase(d, "phase-2"))


def test_missing_build_record(tmp_path):
    d = tmp_path / "phase-2"
    d.mkdir()
    assert any("BUILD.md missing" in p for p in check_phase(d, "phase-2"))


def test_unknown_phase(tmp_path):
    assert check_phase(tmp_path, "phase-9") == ["Unknown phase: phase-9"]


def test_every_phase_requires_owner_and_qa():
    for phase, gates in REQUIRED_GATES.items():
        assert "owner" in gates and "qa" in gates, phase
