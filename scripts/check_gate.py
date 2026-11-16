"""CI merge gate: a phase-* branch needs docs/reviews/<branch>-gate.md with
a `Reviewer:` line and `Verdict: PASS`. Usage: python -m scripts.check_gate <branch>
"""

import re
import sys
from pathlib import Path

REVIEWS = Path("docs/reviews")


def gate_status(reviews_dir: Path, branch: str) -> tuple[bool, str]:
    if not branch.startswith("phase-"):
        return True, "not a phase branch"
    path = Path(reviews_dir) / f"{branch}-gate.md"
    if not path.is_file():
        return False, f"gate file missing: {path}"
    text = path.read_text(encoding="utf-8")
    verdict = re.search(r"^Verdict:\s*(\w+)", text, re.MULTILINE)
    if not verdict:
        return False, "gate file has no 'Verdict:' line"
    if verdict.group(1).upper() != "PASS":
        return False, f"gate verdict is {verdict.group(1)}"
    if not re.search(r"^Reviewer:\s*\S", text, re.MULTILINE):
        return False, "gate file has no 'Reviewer:' line"
    return True, "PASS"


if __name__ == "__main__":
    ok, why = gate_status(REVIEWS, sys.argv[1] if len(sys.argv) > 1 else "")
    print(why)
    raise SystemExit(0 if ok else 1)
