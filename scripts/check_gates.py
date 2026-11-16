"""Merge gate: a phase may merge to main only when every required department
has signed off in docs/reviews/<phase>/<gate>.md.

Each gate file starts with `Verdict: PASS|FAIL` and `Model: <model>`.
docs/reviews/<phase>/BUILD.md records the model that built the phase.
Rules: every required gate exists and says PASS; no reviewer used the
builder's model; the owner gate is signed by the human (`Model: human`).

Usage: python -m scripts.check_gates   (reads docs/reviews/CURRENT_PHASE)
"""

import re
import sys
from pathlib import Path

REQUIRED_GATES: dict[str, tuple[str, ...]] = {
    "phase-1": ("architecture", "qa", "owner"),
    "phase-2": ("architecture", "research", "qa", "academic", "owner"),
    "phase-3": ("architecture", "qa", "devops", "owner"),
    "phase-4": ("architecture", "qa", "owner"),
    "phase-5": ("design", "qa", "owner"),
    "phase-6": ("qa", "devops", "academic", "owner"),
}

_FIELD = re.compile(r"^(Verdict|Model):\s*(\S+)", re.MULTILINE)


def _fields(path: Path) -> dict[str, str]:
    return {k.lower(): v for k, v in _FIELD.findall(path.read_text(encoding="utf-8"))}


def check_phase(phase_dir: Path, phase: str) -> list[str]:
    if phase not in REQUIRED_GATES:
        return [f"Unknown phase: {phase}"]
    problems: list[str] = []
    build = phase_dir / "BUILD.md"
    build_model = _fields(build).get("model") if build.is_file() else None
    if build_model is None:
        problems.append("BUILD.md missing or has no `Model:` line")
    for name in REQUIRED_GATES[phase]:
        path = phase_dir / f"{name}.md"
        if not path.is_file():
            problems.append(f"{name}.md missing")
            continue
        fields = _fields(path)
        if fields.get("verdict") != "PASS":
            problems.append(f"{name}.md verdict is not PASS")
        model = fields.get("model", "")
        if name == "owner":
            if model != "human":
                problems.append("owner.md must be signed by the human owner (`Model: human`)")
        elif build_model and model == build_model:
            problems.append(f"{name}.md reviewer used the same model as the builder ({model})")
    return problems


def main() -> int:
    reviews = Path("docs/reviews")
    phase = (reviews / "CURRENT_PHASE").read_text().strip()
    problems = check_phase(reviews / phase, phase)
    for p in problems:
        print(f"GATE FAIL [{phase}]: {p}")
    if not problems:
        print(f"All gates passed for {phase}.")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
