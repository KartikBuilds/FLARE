"""Deterministic FLARE score v2 — see docs/RISK_METHODOLOGY.md for the full
specification and its changelog against v1. Every factor here is computed
from the same IR/findings/graph every other pipeline stage reads; no step
is delegated to a language model, and nothing here is a probability —
it's a fixed, reproducible function of concrete evidence.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

from app.schemas.analysis import FindingScoreBreakdown
from app.schemas.finding import Finding
from app.schemas.graph import FundFlowGraph
from app.schemas.ir import ProjectIR

FORMULA_VERSION = "2.0.0"

SEVERITY_WEIGHT = {"critical": 100.0, "high": 70.0, "medium": 40.0, "low": 15.0}
REACHABILITY_WEIGHT = {"public": 1.0, "privileged": 0.7, "theoretical": 0.4}

# Categories whose findings are, by construction, about a dependency the
# contract does not control — see docs/DETECTOR_SPECIFICATION.md.
_LIBRARY_TAXONOMY = "library-dependencies"
_MISSING_RECOVERY_TAXONOMY = "missing-recovery"

_ASSEMBLY_RE = re.compile(r"\bassembly\s*\{")
_UNRESOLVED_IMPORT_RE = re.compile(r"(not found|unresolved|cannot find)", re.IGNORECASE)

RISK_BANDS = [
    (80.0, "critical"),
    (60.0, "high"),
    (35.0, "medium"),
    (15.0, "low"),
    (0.0, "minimal"),
]


def band_for(score: float) -> str:
    for threshold, band in RISK_BANDS:
        if score >= threshold:
            return band
    return "minimal"


def asset_exposure_for(role: str | None) -> float:
    """1.0 for a node that IS (or would be) a fund entry/exit point —
    including "blocked", since a blocked node is an exit path that failed,
    not a lesser one. 0.6 for internal/constructor nodes still reachable
    from the graph. 0.3 when the finding couldn't be matched to any node
    (no fund-flow evidence connects it)."""
    if role in ("entry", "exit", "blocked"):
        return 1.0
    if role in ("internal", "constructor"):
        return 0.6
    return 0.3


def dependency_criticality_for(finding: Finding) -> float:
    if finding.taxonomy == _LIBRARY_TAXONOMY:
        return 1.0
    if finding.taxonomy in ("state-transitions", _MISSING_RECOVERY_TAXONOMY):
        return 0.6
    return 0.3


def recovery_offset_for(finding: Finding, graph: FundFlowGraph, blocked_node_ids: set[str]) -> float:
    """0.3 if some *other*, non-blocked "exit"-role node exists in the same
    contract (a working alternative exit) — "other" meaning a different
    node than the one this finding itself is attached to, so a finding on
    a still-"exit"-classified node (e.g. an XFER-* finding that doesn't
    itself flip the node to "blocked") never counts as its own alternative.
    Never higher than 0.3: we have no deterministic way to tell
    "manual/governance-mediated" apart from "fully automated" alternative
    recovery from static analysis alone, so the 0.6 tier from
    docs/RISK_METHODOLOGY.md is intentionally never reached by this
    implementation (documented as a known limitation)."""
    if finding.taxonomy == _MISSING_RECOVERY_TAXONOMY:
        return 0.0
    own_node_id = finding.id.split(":")[1] if ":" in finding.id else None
    contract = own_node_id.split(".")[0] if own_node_id else None
    has_alternative = any(
        n.role == "exit" and n.contract == contract and n.id != own_node_id and n.id not in blocked_node_ids
        for n in graph.nodes
    )
    return 0.3 if has_alternative else 0.0


def _contains_inline_assembly(files: list[Path]) -> bool:
    for f in files:
        try:
            if _ASSEMBLY_RE.search(f.read_text(encoding="utf-8", errors="replace")):
                return True
        except OSError:
            continue
    return False


@dataclass
class CoverageResult:
    multiplier: float = 1.0
    notes: list[str] = field(default_factory=list)


def compute_coverage(ir: ProjectIR, files: list[Path], findings: list[Finding]) -> CoverageResult:
    """Penalty table from docs/RISK_METHODOLOGY.md — only the rows with a
    deterministic signal available today are applied; the rest are noted
    as specified-but-not-yet-computed rather than silently treated as
    "checked and passed". Floored at 0.5."""
    multiplier = 1.0
    notes: list[str] = []

    if any(_UNRESOLVED_IMPORT_RE.search(w) for w in ir.compile_warnings):
        multiplier -= 0.15
        notes.append("Source could not be fully resolved (missing/unresolved imports detected).")

    if _contains_inline_assembly(files):
        multiplier -= 0.10
        notes.append("Inline assembly/Yul is present and not analyzed beyond pattern matching.")

    if findings and not any(f.validated for f in findings):
        multiplier -= 0.10
        notes.append("No Foundry/Anvil dynamic validation was performed for this analysis.")

    notes.append(
        "Not yet computed (no deterministic signal implemented): unresolved external dependency "
        "interfaces; whether externally-referenced contracts are themselves verified."
    )

    return CoverageResult(multiplier=max(0.5, multiplier), notes=notes)


@dataclass
class ScoreResult:
    score: float
    band: str
    coverage: CoverageResult
    breakdown: list[FindingScoreBreakdown]


def score_analysis(
    ir: ProjectIR, findings: list[Finding], graph: FundFlowGraph, files: list[Path]
) -> ScoreResult:
    coverage = compute_coverage(ir, files, findings)

    node_role_by_finding_id: dict[str, str] = {}
    blocked_node_ids: set[str] = set()
    for node in graph.nodes:
        if node.role == "blocked":
            blocked_node_ids.add(node.id)
        for fid in node.finding_ids:
            node_role_by_finding_id[fid] = node.role

    breakdown: list[FindingScoreBreakdown] = []
    for finding in findings:
        severity_weight = SEVERITY_WEIGHT.get(finding.severity, 15.0)
        reachability_weight = REACHABILITY_WEIGHT.get(finding.reachability, 0.4)
        exposure = asset_exposure_for(node_role_by_finding_id.get(finding.id))
        dependency = dependency_criticality_for(finding)
        recovery_offset = recovery_offset_for(finding, graph, blocked_node_ids)

        contribution = (
            severity_weight
            * finding.confidence
            * reachability_weight
            * exposure
            * dependency
            * (1 - recovery_offset)
        )
        breakdown.append(
            FindingScoreBreakdown(
                finding_id=finding.id,
                severity_weight=severity_weight,
                confidence=finding.confidence,
                reachability=finding.reachability,
                reachability_weight=reachability_weight,
                asset_exposure=exposure,
                dependency_criticality=dependency,
                recovery_offset=recovery_offset,
                validated=finding.validated,
                contribution=round(contribution, 4),
            )
        )

    max_contribution = max((b.contribution for b in breakdown), default=0.0)
    score = round(max_contribution * coverage.multiplier, 2)
    score = min(100.0, max(0.0, score))

    return ScoreResult(score=score, band=band_for(score), coverage=coverage, breakdown=breakdown)
