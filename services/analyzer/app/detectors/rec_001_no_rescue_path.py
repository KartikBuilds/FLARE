"""FLARE-REC-001 — No rescue path for unsupported received assets.

Evidence: the contract can receive value (a payable function, or a call to
transferFrom pulling tokens in) but exposes no rescue/sweep/recover-style
function that could move an unexpected asset back out."""

from __future__ import annotations

import re

from app.detectors.base import Detector
from app.schemas.finding import Finding
from app.schemas.ir import ProjectIR

_RESCUE_NAME_RE = re.compile(r"rescue|sweep|recover", re.IGNORECASE)


class NoRescuePathDetector(Detector):
    id = "FLARE-REC-001"
    version = "1.0.0"
    name = "No rescue path for unsupported received assets"
    taxonomy = "missing-recovery"
    default_severity = "medium"
    related_incident_ids = ["gemholic-zksync-2023"]

    def run(self, ir: ProjectIR, source_map: dict[str, str]) -> list[Finding]:
        findings: list[Finding] = []
        for contract in ir.contracts:
            if contract.is_interface or contract.is_library:
                continue

            has_rescue = any(_RESCUE_NAME_RE.search(f.name) for f in contract.functions)
            if has_rescue:
                continue

            entry_points = [
                f
                for f in contract.functions
                if f.state_mutability == "payable"
                or any("transferfrom" in c.target.lower() for c in f.calls)
            ]
            if not entry_points:
                continue

            entry = entry_points[0]
            findings.append(
                self._finding(
                    function=entry,
                    source_map=source_map,
                    confidence=0.65,
                    explanation=(
                        f"'{contract.name}' can receive assets via '{entry.name}' but defines no "
                        "rescue/sweep/recover function anywhere in the contract."
                    ),
                    triggering_condition=(
                        f"'{entry.name}' accepts value with no matching rescue-style function in "
                        f"'{contract.name}'."
                    ),
                    asset_lock_consequence=(
                        "Any asset that ends up in this contract outside its expected accounting "
                        "(an accidental transfer, a different token, a rounding remainder) has no "
                        "path back out."
                    ),
                    remediation=(
                        "Add an access-controlled rescue/sweep function that can move an arbitrary "
                        "ERC-20 balance (or stray ETH) out of the contract."
                    ),
                )
            )
        return findings
