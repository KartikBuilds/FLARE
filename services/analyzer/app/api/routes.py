from __future__ import annotations

from datetime import UTC, datetime
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, HTTPException, UploadFile
from fastapi.responses import HTMLResponse

from app.config import settings
from app.core.intake import (
    IntakeError,
    clone_github_repo,
    extract_zip,
    fetch_verified_source,
    resolve_benchmark_case,
    validate_sol_files,
)
from app.core.pipeline import queue_analysis, run_pipeline
from app.core.report import render_html_report
from app.core.workspace import cleanup_workspace, persistent_workspace
from app.db.database import db_session
from app.schemas.analysis import AnalysisSummary

router = APIRouter()


@router.get("/health")
def health() -> dict:
    return {"status": "ok", "time": datetime.now(UTC).isoformat()}


@router.get("/analyses", response_model=list[AnalysisSummary])
def list_analyses() -> list[AnalysisSummary]:
    with db_session() as conn:
        rows = conn.execute("SELECT result_json FROM analyses ORDER BY created_at DESC").fetchall()
    return [AnalysisSummary.model_validate_json(row["result_json"]) for row in rows]


@router.get("/analyses/{analysis_id}", response_model=AnalysisSummary)
def get_analysis(analysis_id: str) -> AnalysisSummary:
    with db_session() as conn:
        row = conn.execute("SELECT result_json FROM analyses WHERE id = ?", (analysis_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return AnalysisSummary.model_validate_json(row["result_json"])


@router.get("/analyses/{analysis_id}/report.html", response_class=HTMLResponse)
def get_analysis_report(analysis_id: str) -> HTMLResponse:
    with db_session() as conn:
        row = conn.execute("SELECT result_json FROM analyses WHERE id = ?", (analysis_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    analysis = AnalysisSummary.model_validate_json(row["result_json"])
    return HTMLResponse(content=render_html_report(analysis))


def _run_and_cleanup(analysis_id: str, files: list[Path], project_name: str, workspace: Path) -> None:
    try:
        run_pipeline(analysis_id, files, project_name)
    finally:
        cleanup_workspace(workspace)


@router.post("/analyses/upload-files", response_model=AnalysisSummary)
async def upload_files(files: list[UploadFile], background_tasks: BackgroundTasks) -> AnalysisSummary:
    contents = [await f.read() for f in files]
    try:
        validate_sol_files([f.filename or "" for f in files], [len(c) for c in contents])
    except IntakeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    workspace = persistent_workspace()
    saved_paths = []
    for f, content in zip(files, contents, strict=True):
        path = workspace / "extracted" / (f.filename or "unnamed.sol")
        path.write_bytes(content)
        saved_paths.append(path)

    project_name = saved_paths[0].stem if saved_paths else "upload"
    summary = queue_analysis(workspace.name, project_name)
    background_tasks.add_task(_run_and_cleanup, workspace.name, saved_paths, project_name, workspace)
    return summary


@router.post("/analyses/upload-zip", response_model=AnalysisSummary)
async def upload_zip(file: UploadFile, background_tasks: BackgroundTasks) -> AnalysisSummary:
    workspace = persistent_workspace()
    zip_path = workspace / "intake" / "project.zip"
    zip_path.write_bytes(await file.read())

    try:
        sol_files = extract_zip(zip_path, workspace / "extracted")
    except IntakeError as exc:
        cleanup_workspace(workspace)
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    project_name = (file.filename or "project.zip").removesuffix(".zip")
    summary = queue_analysis(workspace.name, project_name)
    background_tasks.add_task(_run_and_cleanup, workspace.name, sol_files, project_name, workspace)
    return summary


@router.post("/analyses/github", response_model=AnalysisSummary)
async def analyze_github(payload: dict, background_tasks: BackgroundTasks) -> AnalysisSummary:
    url = payload.get("url", "")
    workspace = persistent_workspace()

    try:
        sol_files = clone_github_repo(url, workspace / "extracted")
    except IntakeError as exc:
        cleanup_workspace(workspace)
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    owner, repo = url.rstrip("/").split("/")[-2:]
    project_name = repo or owner
    summary = queue_analysis(workspace.name, project_name)
    background_tasks.add_task(_run_and_cleanup, workspace.name, sol_files, project_name, workspace)
    return summary


@router.post("/analyses/verified-address", response_model=AnalysisSummary)
async def analyze_verified_address(payload: dict, background_tasks: BackgroundTasks) -> AnalysisSummary:
    if not settings.etherscan_api_key:
        raise HTTPException(
            status_code=501,
            detail=(
                "Verified-address intake is not configured — set FLARE_ETHERSCAN_API_KEY to "
                "enable it. Every other intake method (files, ZIP, GitHub URL, benchmark case) "
                "works without it."
            ),
        )

    address = payload.get("address", "")
    workspace = persistent_workspace()

    try:
        sol_files = fetch_verified_source(address, settings.etherscan_api_key, workspace / "extracted")
    except IntakeError as exc:
        cleanup_workspace(workspace)
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    project_name = address.strip()
    summary = queue_analysis(workspace.name, project_name)
    background_tasks.add_task(_run_and_cleanup, workspace.name, sol_files, project_name, workspace)
    return summary


@router.post("/analyses/benchmark", response_model=AnalysisSummary)
async def analyze_benchmark_case(payload: dict, background_tasks: BackgroundTasks) -> AnalysisSummary:
    case = payload.get("case", "")
    workspace = persistent_workspace()

    try:
        source_path = resolve_benchmark_case(case, settings.benchmarks_dir)
    except IntakeError as exc:
        cleanup_workspace(workspace)
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    dest = workspace / "extracted" / source_path.name
    dest.write_bytes(source_path.read_bytes())

    project_name = case
    summary = queue_analysis(workspace.name, project_name)
    background_tasks.add_task(_run_and_cleanup, workspace.name, [dest], project_name, workspace)
    return summary
