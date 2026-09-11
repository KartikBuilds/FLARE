"""Mirrors packages/schemas/src/analysis.ts on the TypeScript side — keep
the two in sync by hand; there are few enough fields that a codegen step
would be more ceremony than it's worth right now (tracked as a possible
follow-up in docs/LIMITATIONS.md)."""

from __future__ import annotations

from enum import StrEnum

from app.schemas.base import CamelModel
from app.schemas.finding import Finding
from app.schemas.graph import FundFlowGraph
from app.schemas.ir import ProjectIR


class AnalysisStatus(StrEnum):
    QUEUED = "queued"
    INTAKE = "intake"
    COMPILING = "compiling"
    ANALYZING = "analyzing"
    DETECTING = "detecting"
    VALIDATING = "validating"
    SCORING = "scoring"
    COMPLETE = "complete"
    FAILED = "failed"


class SeverityCounts(CamelModel):
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0


class FindingScoreBreakdown(CamelModel):
    """Per-finding factor values behind the analysis's overall FLARE score —
    see docs/RISK_METHODOLOGY.md. Exposed so the UI can show *why* a score
    is what it is, not just the final number."""

    finding_id: str
    severity_weight: float
    confidence: float
    reachability: str
    reachability_weight: float
    asset_exposure: float
    dependency_criticality: float
    recovery_offset: float
    validated: bool
    contribution: float


class AnalysisSummary(CamelModel):
    id: str
    origin: str = "live"
    project_name: str
    project_version: str = "uploaded"
    status: AnalysisStatus
    created_at: str
    flare_score: float | None = None
    risk_band: str | None = None
    formula_version: str | None = None
    coverage: float | None = None
    coverage_notes: list[str] = []
    score_breakdown: list[FindingScoreBreakdown] = []
    finding_count: int = 0
    severity_counts: SeverityCounts = SeverityCounts()
    error: str | None = None
    ir: ProjectIR | None = None
    findings: list[Finding] = []
    graph: FundFlowGraph | None = None
