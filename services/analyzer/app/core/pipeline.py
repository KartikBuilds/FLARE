"""Orchestrates intake -> compile -> Slither -> IR -> detectors for one
analysis and persists the result. Graph construction, Foundry validation
and full risk scoring are added on top of this in later milestones (see
docs/ARCHITECTURE.md)."""

from __future__ import annotations

from datetime import UTC, datetime
from pathlib import Path

from app.core.cache import compute_content_hash, get_cached_ir, store_cached_ir
from app.core.compiler import CompileError, compile_check
from app.core.slither_service import SlitherAnalysisError, run_slither
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

        cached_ir = get_cached_ir(content_hash)
        if cached_ir is not None:
            ir = cached_ir
        else:
            compile_result = compile_check(files)

            summary = summary.model_copy(update={"status": AnalysisStatus.ANALYZING})
            _save(summary, content_hash)

            ir = run_slither(files, compile_result.solc_version)
            store_cached_ir(content_hash, ir)

        summary = summary.model_copy(update={"status": AnalysisStatus.DETECTING})
        _save(summary, content_hash)

        findings = run_all_detectors(ir, files)
        counts = SeverityCounts()
        for finding in findings:
            if hasattr(counts, finding.severity):
                setattr(counts, finding.severity, getattr(counts, finding.severity) + 1)

        summary = summary.model_copy(
            update={
                "status": AnalysisStatus.COMPLETE,
                "ir": ir,
                "findings": findings,
                "finding_count": len(findings),
                "severity_counts": counts,
                "coverage": 1.0 if not ir.compile_warnings else 0.85,
            }
        )
        _save(summary, content_hash)
        return summary

    except (CompileError, SlitherAnalysisError) as exc:
        summary = summary.model_copy(update={"status": AnalysisStatus.FAILED, "error": str(exc)})
        _save(summary, content_hash)
        return summary
