"""Every detector is a small, deterministic procedure over ProjectIR. None
of them may create a Finding without a concrete source location and an
excerpt of the actual triggering code — see docs/DETECTOR_SPECIFICATION.md.
No detector here calls an LLM or any other non-deterministic service."""

from __future__ import annotations

import re
from abc import ABC, abstractmethod
from pathlib import Path

from app.schemas.finding import Finding
from app.schemas.ir import FunctionIR, ProjectIR, SourceLocation

_GUARDED_MODIFIER_RE = re.compile(r"only|auth|admin|owner|restrict|guard", re.IGNORECASE)


def reachability_for(function: FunctionIR) -> str:
    """Deterministic heuristic, not a full access-control analysis: a
    public/external function is "public" reachability unless it carries a
    modifier whose *name* looks access-control-shaped (only.../auth.../
    onlyOwner/...), in which case it's "privileged". Anything not directly
    externally callable is "theoretical" — see docs/RISK_METHODOLOGY.md."""
    if function.visibility not in ("public", "external"):
        return "theoretical"
    if any(_GUARDED_MODIFIER_RE.search(m) for m in function.modifiers):
        return "privileged"
    return "public"


def build_source_map(files: list[Path]) -> dict[str, str]:
    """Keyed by basename — Slither reports source-mapping filenames
    relative to the compilation root, which doesn't necessarily match the
    absolute paths intake wrote to disk; basename is the stable join key
    for the small, mostly-single-file projects this analyzer handles."""
    source_map: dict[str, str] = {}
    for f in files:
        try:
            source_map[f.name] = f.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
    return source_map


def excerpt_for(source_map: dict[str, str], location: SourceLocation | None, context: int = 0) -> str:
    if location is None:
        return ""
    content = source_map.get(Path(location.file).name)
    if content is None:
        return ""
    lines = content.splitlines()
    start = max(0, location.line_start - 1 - context)
    end = min(len(lines), location.line_end + context)
    return "\n".join(lines[start:end])


class Detector(ABC):
    id: str
    version: str
    name: str
    taxonomy: str
    default_severity: str
    related_incident_ids: list[str] = []

    @abstractmethod
    def run(self, ir: ProjectIR, source_map: dict[str, str]) -> list[Finding]:
        """Returns zero or more Findings. Must never raise for a project
        that compiled and produced IR — an unexpected shape should be
        treated as "no finding", not an unhandled exception that would
        abort the whole detector run."""

    def _finding(
        self,
        *,
        function: FunctionIR,
        source_map: dict[str, str],
        confidence: float,
        explanation: str,
        triggering_condition: str,
        asset_lock_consequence: str,
        remediation: str,
        severity: str | None = None,
        index: int = 0,
    ) -> Finding:
        location = function.source
        return Finding(
            id=f"{self.id}:{function.contract}.{function.name}:{index}",
            detector_id=self.id,
            detector_version=self.version,
            title=self.name,
            taxonomy=self.taxonomy,
            severity=severity or self.default_severity,
            confidence=confidence,
            reachability=reachability_for(function),
            file=location.file if location else "",
            line_start=location.line_start if location else 0,
            line_end=location.line_end if location else 0,
            code_excerpt=excerpt_for(source_map, location),
            explanation=explanation,
            triggering_condition=triggering_condition,
            asset_lock_consequence=asset_lock_consequence,
            remediation=remediation,
            related_incident_ids=self.related_incident_ids,
            validated=False,
        )
