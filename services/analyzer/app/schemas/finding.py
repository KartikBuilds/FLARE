"""Mirrors packages/schemas/src/analysis.ts's Finding — see the note in
schemas/analysis.py about keeping the two in sync by hand."""

from __future__ import annotations

from pydantic import BaseModel


class Finding(BaseModel):
    id: str
    detector_id: str
    detector_version: str
    title: str
    taxonomy: str
    severity: str  # "critical" | "high" | "medium" | "low"
    confidence: float
    file: str
    line_start: int
    line_end: int
    code_excerpt: str
    explanation: str
    triggering_condition: str
    asset_lock_consequence: str
    remediation: str
    related_incident_ids: list[str] = []
    validated: bool = False
    false_positive_suppressed: bool = False
    suppression_reason: str | None = None
