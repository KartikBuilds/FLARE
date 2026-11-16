"""The Claude Code hook that blocks unsafe git commands."""

import json
import subprocess
import sys
from pathlib import Path

GUARD = Path(__file__).resolve().parents[2] / ".claude" / "hooks" / "guard.py"


def run_guard(command, branch="feature-x"):
    payload = json.dumps({"tool_name": "Bash", "tool_input": {"command": command}})
    return subprocess.run([sys.executable, str(GUARD)], input=payload, text=True, capture_output=True,
                          env={"FLARE_GUARD_BRANCH": branch, "PATH": "/usr/bin:/bin"})


def test_blocks_push_to_main():
    assert run_guard("git push origin main").returncode == 2


def test_blocks_push_head_to_main():
    assert run_guard("git push origin HEAD:main").returncode == 2


def test_blocks_force_push():
    assert run_guard("git push --force origin phase-2").returncode == 2
    assert run_guard("git push -f").returncode == 2


def test_blocks_commit_on_main():
    r = run_guard('git commit -m "x"', branch="main")
    assert r.returncode == 2 and "main" in r.stderr


def test_allows_commit_on_feature_branch():
    assert run_guard('git commit -m "x"').returncode == 0


def test_allows_push_feature_branch():
    assert run_guard("git push -u origin phase-2-engine").returncode == 0


def test_allows_unrelated_commands():
    assert run_guard("pytest -q").returncode == 0


def test_bad_input_does_not_block():
    r = subprocess.run([sys.executable, str(GUARD)], input="not json", text=True, capture_output=True)
    assert r.returncode == 0
