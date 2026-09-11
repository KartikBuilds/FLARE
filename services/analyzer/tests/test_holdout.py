"""Tests for the independent holdout benchmark runner
(app/core/benchmark.py::run_holdout_case / run_holdout_benchmark) — see
docs/BENCHMARK_METHODOLOGY.md and evaluation/HOLDOUT_EVALUATION.md for the
full methodology and results this exercises."""

from pathlib import Path

import pytest

from app.core.benchmark import run_holdout_benchmark, run_holdout_case

HOLDOUT_DIR = Path("/srv/contracts/holdout")
pytestmark = pytest.mark.skipif(not HOLDOUT_DIR.exists(), reason="contracts/holdout not mounted")


class TestRunHoldoutCase:
    def test_single_file_vulnerable_case_is_flagged(self):
        actual, count, error = run_holdout_case(
            [HOLDOUT_DIR / "holdout-03-pausable-vault" / "PausableVault.sol"]
        )
        assert error is None
        assert actual is True
        assert count > 0

    def test_single_file_safe_case_runs_without_error(self):
        # Not asserting "no findings" here — the known FLARE-REC-001/
        # XFER-002 precision gap (documented in DETECTOR_SPECIFICATION.md
        # and evaluation/HOLDOUT_EVALUATION.md) means several safe holdout
        # fixtures ARE flagged today. This test only guards against a
        # regression in whether the case can be analyzed at all.
        actual, count, error = run_holdout_case(
            [HOLDOUT_DIR / "holdout-10-safe-staking-with-withdraw" / "SimpleStaking.sol"]
        )
        assert error is None
        assert isinstance(actual, bool)
        assert count >= 0

    def test_multi_file_case_analyzes_every_file(self):
        """Regression test for a real bug this benchmark found: Slither's
        comma-joined multi-file invocation is not actually supported by
        crytic-compile's solc platform — see the docstring on
        run_holdout_case and docs/LIMITATIONS.md."""
        actual, count, error = run_holdout_case(
            [
                HOLDOUT_DIR / "holdout-01-library-registry" / "Registry.sol",
                HOLDOUT_DIR / "holdout-01-library-registry" / "VaultRouter.sol",
            ]
        )
        assert error is None
        assert actual is True
        assert count > 0


class TestRunHoldoutBenchmark:
    def test_full_run_has_perfect_recall(self):
        """The real, current headline result: 100% recall (every genuinely
        vulnerable holdout case — including the 3 multi-contract ones — is
        caught), alongside a known, documented precision gap. This test
        pins recall, not precision, since precision is expected to be
        <100% until FLARE-REC-001 is revised (tracked, not silently
        tolerated — see DETECTOR_SPECIFICATION.md)."""
        report = run_holdout_benchmark(HOLDOUT_DIR)
        assert report.recall == 1.0
        assert len(report.cases) == 10
        assert sum(1 for c in report.cases if c.outcome == "error") == 0
