"""Orchestrates intake -> compile -> Slither -> detectors -> validation ->
graph -> deterministic FLARE score -> persisted result for one analysis.
See docs/ARCHITECTURE.md and docs/RISK_METHODOLOGY.md."""

from __future__ import annotations

from datetime import UTC, datetime
from pathlib import Path

from app.core.cache import compute_content_hash, get_cached_ir, store_cached_ir
from app.core.compiler import CompileError, compile_check
from app.core.graph import build_fund_flow_graph
from app.core.scoring import FORMULA_VERSION, score_analysis
from app.core.slither_service import SlitherAnalysisError, run_slither
from app.core.validation import validate_findings
from app.db.database import db_session
from app.detectors.registry import run_all_detectors
from app.schemas.analysis import AnalysisStatus, AnalysisSummary, SeverityCounts


def _save(summary: AnalysisSummary, content_hash: str) -> None:
    with db_session() as conn:
        conn.execute(
            """INSERT OR REPLACE INTO analyses
               (id, content_hash, project_name, status, created_at, result_json)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (
                summary.id,
                content_hash,
                summary.project_name,
                summary.status.value,
                summary.created_at,
                summary.model_dump_json(),
            ),
        )


def queue_analysis(analysis_id: str, project_name: str) -> AnalysisSummary:
    """Creates and persists the initial `queued` record synchronously, so an
    endpoint can return it immediately and hand the actual work to a
    background task — the caller polls GET /analyses/{id} for progress."""
    summary = AnalysisSummary(
        id=analysis_id,
        project_name=project_name,
        status=AnalysisStatus.QUEUED,
        created_at=datetime.now(UTC).isoformat(),
    )
    _save(summary, content_hash="")
    return summary


def run_pipeline(analysis_id: str, files: list[Path], project_name: str) -> AnalysisSummary:
    created_at = datetime.now(UTC).isoformat()
    summary = AnalysisSummary(
        id=analysis_id, project_name=project_name, status=AnalysisStatus.INTAKE, created_at=created_at
    )
    content_hash = compute_content_hash(files)
    _save(summary, content_hash)

    try:
        summary = summary.model_copy(update={"status": AnalysisStatus.COMPILING})
        _save(summary, content_hash)

        # Always compiled fresh — the validation stage below needs real
        # bytecode/ABI, and solc compilation is cheap relative to Slither.
        compile_result = compile_check(files)

        cached_ir = get_cached_ir(content_hash)
        if cached_ir is not None:
            ir = cached_ir
        else:
            summary = summary.model_copy(update={"status": AnalysisStatus.ANALYZING})
            _save(summary, content_hash)

            ir = run_slither(files, compile_result.solc_version)
            store_cached_ir(content_hash, ir)

        summary = summary.model_copy(update={"status": AnalysisStatus.DETECTING})
        _save(summary, content_hash)

        findings = run_all_detectors(ir, files)

        summary = summary.model_copy(update={"status": AnalysisStatus.VALIDATING})
        _save(summary, content_hash)

        findings = validate_findings(findings, compile_result)

        summary = summary.model_copy(update={"status": AnalysisStatus.SCORING})
        _save(summary, content_hash)

        counts = SeverityCounts()
        for finding in findings:
            if hasattr(counts, finding.severity):
                setattr(counts, finding.severity, getattr(counts, finding.severity) + 1)

        fund_flow_graph = build_fund_flow_graph(ir, findings)
        score_result = score_analysis(ir, findings, fund_flow_graph, files)

        summary = summary.model_copy(
            update={
                "status": AnalysisStatus.COMPLETE,
                "ir": ir,
                "findings": findings,
                "finding_count": len(findings),
                "severity_counts": counts,
                "flare_score": score_result.score,
                "risk_band": score_result.band,
                "formula_version": FORMULA_VERSION,
                "coverage": score_result.coverage.multiplier,
                "coverage_notes": score_result.coverage.notes,
                "score_breakdown": score_result.breakdown,
                "graph": fund_flow_graph,
            }
        )
        _save(summary, content_hash)
        return summary

    except (CompileError, SlitherAnalysisError) as exc:
        summary = summary.model_copy(update={"status": AnalysisStatus.FAILED, "error": str(exc)})
        _save(summary, content_hash)
        return summary
