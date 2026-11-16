"""Claude Code PreToolUse hook: block unsafe git commands (exit code 2 blocks).

- no commits while on main
- no pushes to main
- no force pushes
Malformed input never blocks (the hook must not break normal work).
"""

import json
import os
import re
import subprocess
import sys


def current_branch() -> str:
    if "FLARE_GUARD_BRANCH" in os.environ:
        return os.environ["FLARE_GUARD_BRANCH"]
    try:
        return subprocess.run(["git", "rev-parse", "--abbrev-ref", "HEAD"], capture_output=True,
                              text=True, timeout=5).stdout.strip()
    except Exception:
        return ""


def reason_to_block(command: str, branch: str) -> str | None:
    for part in re.split(r"&&|\|\||;", command):
        words = part.split()
        if len(words) < 2 or words[0] != "git":
            continue
        if words[1] == "commit" and branch == "main":
            return "Commits on main are not allowed. Create a branch first."
        if words[1] == "push":
            if any(w in ("--force", "-f", "--force-with-lease") for w in words):
                return "Force pushes are not allowed."
            if any(w == "main" or w.endswith(":main") for w in words[2:]):
                return "Pushing to main is not allowed. Open a pull request; the owner merges."
    return None


def main() -> int:
    try:
        command = json.load(sys.stdin)["tool_input"]["command"]
    except Exception:
        return 0
    reason = reason_to_block(command, current_branch())
    if reason:
        print(reason, file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
