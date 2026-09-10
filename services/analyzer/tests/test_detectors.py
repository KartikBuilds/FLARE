"""Scores every detector against its own benchmark fixtures
(contracts/benchmarks/*/ground-truth.json) and asserts perfect precision
and recall — a shipped detector with any known failure against its own
fixtures does not meet the quality bar this registry commits to (see
docs/DETECTOR_SPECIFICATION.md)."""

from pathlib import Path

import pytest

from app.core.benchmark import run_benchmark
from app.detectors.registry import DETECTOR_CLASSES

BENCHMARKS_DIR = Path("/srv/contracts/benchmarks")
if not BENCHMARKS_DIR.exists():
    BENCHMARKS_DIR = Path(__file__).resolve().parents[3] / "contracts" / "benchmarks"


@pytest.mark.skipif(not BENCHMARKS_DIR.exists(), reason="contracts/benchmarks not mounted")
class TestBenchmarkSuite:
    def test_registry_has_ten_detectors(self):
        assert len(DETECTOR_CLASSES) == 10

    def test_every_detector_has_a_fixture_directory(self):
        fixture_dirs = {p.name for p in BENCHMARKS_DIR.iterdir() if p.is_dir()}
        for cls in DETECTOR_CLASSES:
            expected_dir = cls.id.lower()
            assert expected_dir in fixture_dirs, f"missing fixtures for {cls.id}"

    def test_perfect_precision_and_recall_against_fixtures(self):
        report = run_benchmark(BENCHMARKS_DIR)
        failures = [c for c in report.cases if c.outcome not in ("true_positive", "true_negative")]
        assert not failures, f"{len(failures)} fixture(s) misclassified: {failures}"
        assert report.precision == 1.0
        assert report.recall == 1.0
        assert len(report.cases) == 40
