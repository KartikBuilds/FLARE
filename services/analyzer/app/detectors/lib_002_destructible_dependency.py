"""FLARE-LIB-002 — Destructible library dependency with no replacement path.

Evidence: this project contains a contract with a reachable selfdestruct,
and a *different* contract in the same project delegatecalls into it (or
into a mutable address that could point at it) with no migration/upgrade
function to repoint the dependency if it is destroyed."""

from __future__ import annotations

import re

from app.detectors.base import Detector
from app.schemas.finding import Finding
from app.schemas.ir import FunctionIR, ProjectIR

_MIGRATION_NAME_RE = re.compile(r"migrat|upgrad|setimplementation|repoint", re.IGNORECASE)


def _looks_like_migration(func: FunctionIR) -> bool:
    return bool(_MIGRATION_NAME_RE.search(func.name))


class DestructibleDependencyDetector(Detector):
    id = "FLARE-LIB-002"
    version = "1.0.0"
    name = "Destructible library dependency with no replacement path"
    taxonomy = "library-dependencies"
    default_severity = "critical"
    related_incident_ids = ["parity-multisig-2017"]

    def run(self, ir: ProjectIR, source_map: dict[str, str]) -> list[Finding]:
        findings: list[Finding] = []
        selfdestructible_contracts = {
            c.name for c in ir.contracts if any(f.contains_selfdestruct for f in c.functions)
        }
        if not selfdestructible_contracts:
            return findings

        for contract in ir.contracts:
            if contract.name in selfdestructible_contracts:
                continue
            has_migration = any(_looks_like_migration(f) for f in contract.functions)
            if has_migration:
                continue
            for func in contract.functions:
                if not func.contains_delegatecall:
                    continue
                findings.append(
                    self._finding(
                        function=func,
                        source_map=source_map,
                        confidence=0.6,
                        explanation=(
                            f"'{contract.name}.{func.name}' delegatecalls out, and this project also "
                            f"defines a contract with a reachable selfdestruct "
                            f"({', '.join(sorted(selfdestructible_contracts))}), with no migration "
                            f"function found in '{contract.name}'."
                        ),
                        triggering_condition=(
                            "delegatecall present alongside a selfdestructible dependency contract "
                            "and no migrate/upgrade-style function."
                        ),
                        asset_lock_consequence=(
                            "If the dependency contract is destroyed, every function in this "
                            "contract that relies on it — including any that hold or move assets — "
                            "can become permanently unreachable, with no way to repoint the "
                            "dependency."
                        ),
                        remediation=(
                            "Add a governed migration/upgrade function so dependents can repoint at "
                            "a new implementation if the current one is ever destroyed."
                        ),
                    )
                )
        return findings
