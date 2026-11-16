# FLARE — rules for every Claude session

FLARE answers: "Can funds get permanently stuck in this Solidity contract, and where?"
Read first: docs/superpowers/specs/2026-11-16-flare-product-design.md (approved design)
and the current plan in docs/superpowers/plans/.

## Non-negotiable
1. Never return mock, sample, or hard-coded findings or metrics.
2. Tests first (superpowers:test-driven-development); verify before claiming done
   (superpowers:verification-before-completion).
3. A failed or timed-out analysis is `incomplete`/`failed`, never a risk level.
4. Every dependency pinned with `==` in pyproject.toml.
5. Benchmark test set is frozen before detector tuning and never used to tune.
6. Never push to main. Work on branches; the owner merges.
7. Submitted source is never logged or stored beyond the scan.

## Departments, models and gates
Follow docs/process/departments.md. Departments are agents in .claude/agents/.
Builder and reviewer always run on different models; reviewers never edit code.
A phase-* branch merges only when docs/reviews/<branch>-gate.md says `Verdict: PASS`
(CI enforces it). The hook in .claude/hooks/guard.py blocks commits on main, pushes to
main and force pushes.

## Commands
- Setup: `python3.11 -m venv .venv && .venv/bin/pip install -e .[dev]`
- Compilers: `.venv/bin/solc-select install 0.8.24`
- Tests: `.venv/bin/pytest -q`
- Scan: `.venv/bin/flare scan path/to/Contract.sol --format text`
