"""FLARE-REC-002 — Pause mechanism disables recovery, not just operation.

Evidence: a rescue/recover/emergency-style function carries the same
pause-gating modifier as normal operations, and no *other* recovery
function exists that remains callable while paused."""

from __future__ import annotations

import re

from app.detectors.base import Detector
from app.schemas.finding import Finding
from app.schemas.ir import ProjectIR

_PAUSE_MODIFIER_RE = re.compile(r"pause", re.IGNORECASE)
_RECOVERY_NAME_RE = re.compile(r"rescue|recover|emergency", re.IGNORECASE)


class PauseDisablesRecoveryDetector(Detector):
    id = "FLARE-REC-002"
    version = "1.0.0"
    name = "Pause mechanism disables recovery, not just operation"
    taxonomy = "missing-recovery"
    default_severity = "high"

    def run(self, ir: ProjectIR, source_map: dict[str, str]) -> list[Finding]:
        findings: list[Finding] = []
        for contract in ir.contracts:
            pause_modifiers = {
                m for f in contract.functions for m in f.modifiers if _PAUSE_MODIFIER_RE.search(m)
            }
            if not pause_modifiers:
                continue

            recovery_funcs = [f for f in contract.functions if _RECOVERY_NAME_RE.search(f.name)]
            if not recovery_funcs:
                continue

            for func in recovery_funcs:
                gated = set(func.modifiers) & pause_modifiers
                if not gated:
                    continue
                alternative = [
                    f
                    for f in recovery_funcs
                    if f is not func and not (set(f.modifiers) & pause_modifiers)
                ]
                if alternative:
                    continue
                findings.append(
                    self._finding(
                        function=func,
                        source_map=source_map,
                        confidence=0.8,
                        explanation=(
                            f"'{func.name}' is gated by {sorted(gated)}, the same pause modifier "
                            f"applied to normal operations in '{contract.name}', and no other "
                            "recovery function remains callable while paused."
                        ),
                        triggering_condition=f"modifiers on {func.name}: {func.modifiers}",
                        asset_lock_consequence=(
                            "Pausing the contract — often done specifically to protect users during "
                            "an incident — simultaneously removes the only recovery path, leaving "
                            "assets stuck for the duration of the pause with no override."
                        ),
                        remediation=(
                            "Exempt the recovery/rescue function from the pause modifier, or add a "
                            "separate always-available emergency exit."
                        ),
                    )
                )
        return findings
