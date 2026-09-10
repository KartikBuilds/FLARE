import shutil

from app.core.pipeline import run_pipeline
from app.db.database import init_db
from app.schemas.analysis import AnalysisStatus


def test_pipeline_completes_for_valid_contract(tmp_path, fixtures_dir):
    init_db()
    target = tmp_path / "Simple.sol"
    shutil.copy(fixtures_dir / "Simple.sol", target)

    summary = run_pipeline("test-analysis-1", [target], "Simple")

    assert summary.status == AnalysisStatus.COMPLETE
    assert summary.ir is not None
    assert any(c.name == "Simple" for c in summary.ir.contracts)
    assert summary.error is None


def test_pipeline_fails_gracefully_on_bad_source(tmp_path):
    init_db()
    target = tmp_path / "Bad.sol"
    target.write_text("pragma solidity 0.8.24; this is not valid solidity at all")

    summary = run_pipeline("test-analysis-2", [target], "Bad")

    assert summary.status == AnalysisStatus.FAILED
    assert summary.error is not None


def test_pipeline_reuses_cache_on_second_run(tmp_path, fixtures_dir):
    init_db()
    target = tmp_path / "Simple.sol"
    shutil.copy(fixtures_dir / "Simple.sol", target)

    first = run_pipeline("test-analysis-3", [target], "Simple")
    second = run_pipeline("test-analysis-4", [target], "Simple")

    assert first.status == AnalysisStatus.COMPLETE
    assert second.status == AnalysisStatus.COMPLETE
    assert first.ir == second.ir
