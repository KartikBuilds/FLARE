"""FLARE-WD-001 — Withdrawal function with an unsatisfiable condition.

Evidence: a require()/assert() whose condition can never be true under any
externally reachable call — the concrete, checkable case this detector
looks for is `msg.sender == address(0)`, since no transaction can
originate from the zero address."""

from __future__ import annotations

import re

from app.detectors.base import Detector
from app.schemas.finding import Finding
from app.schemas.ir import ProjectIR

_IMPOSSIBLE_RE = re.compile(r"msg\.sender\s*==\s*address\(\s*0\s*\)")


class UnsatisfiableConditionDetector(Detector):
    id = "FLARE-WD-001"
    version = "1.0.0"
    name = "Withdrawal function with an unsatisfiable condition"
    taxonomy = "withdrawal-failures"
    default_severity = "high"

    def run(self, ir: ProjectIR, source_map: dict[str, str]) -> list[Finding]:
        findings: list[Finding] = []
        for contract in ir.contracts:
            for func in contract.functions:
                for i, req in enumerate(func.requires):
                    if not _IMPOSSIBLE_RE.search(req):
                        continue
                    findings.append(
                        self._finding(
                            function=func,
                            source_map=source_map,
                            confidence=0.95,
                            explanation=(
                                f"'{func.name}' contains a require() that can never be satisfied: "
                                "no transaction can be sent from the zero address, so this branch is "
                                "permanently unreachable."
                            ),
                            triggering_condition=req,
                            asset_lock_consequence=(
                                "Any assets whose exit depends on this function are permanently "
                                "inaccessible — the condition guarding withdrawal can never be met "
                                "by a real caller."
                            ),
                            remediation=(
                                "Replace the unsatisfiable check with the intended access-control or "
                                "state condition (likely `msg.sender == owner` or similar)."
                            ),
                            index=i,
                        )
                    )
        return findings
