"""FLARE-STATE-002 — One-way transition disables a previously available
redemption.

Evidence: a redeem/withdraw/claim-style function requires an enum state
variable to equal some value A; a different function transitions that
variable from A to a value B with no function transitioning back from B
to A. After that transition, the redemption function is permanently
unreachable — regardless of whether some other mechanism exists in B."""

from __future__ import annotations

import re

from app.detectors.base import Detector
from app.schemas.finding import Finding
from app.schemas.ir import ProjectIR

_EXIT_NAME_RE = re.compile(r"withdraw|redeem|claim", re.IGNORECASE)


def _required_value(requirement: str, var: str, values: list[str]) -> str | None:
    normalized = requirement.replace(" ", "")
    if f"!{var}" in normalized or var not in normalized or "==" not in normalized:
        return None
    for value in values:
        if value in normalized:
            return value
    return None


class OneWayTransitionDetector(Detector):
    id = "FLARE-STATE-002"
    version = "1.0.0"
    name = "One-way transition disables a previously available redemption"
    taxonomy = "state-transitions"
    default_severity = "high"
    related_incident_ids = ["lido-stsol-2024"]

    def run(self, ir: ProjectIR, source_map: dict[str, str]) -> list[Finding]:
        findings: list[Finding] = []
        for contract in ir.contracts:
            enum_vars = [v for v in contract.state_variables if v.is_enum and len(v.enum_values) >= 2]
            for var in enum_vars:
                exit_funcs = [f for f in contract.functions if _EXIT_NAME_RE.search(f.name)]
                for exit_func in exit_funcs:
                    required = None
                    for req in exit_func.requires:
                        required = _required_value(req, var.name, var.enum_values)
                        if required:
                            break
                    if not required:
                        continue

                    for other in var.enum_values:
                        if other == required:
                            continue
                        forward = [
                            f
                            for f in contract.functions
                            if any(
                                var.name in s.replace(" ", "") and other in s.replace(" ", "")
                                for s in f.assignment_statements
                            )
                        ]
                        if not forward:
                            continue
                        # Exclude the constructor: its initial assignment (e.g.
                        # `state = State.Open` in `constructor()`) is setup, not a
                        # transition back from a later state.
                        backward = any(
                            var.name in s.replace(" ", "") and required in s.replace(" ", "")
                            for f in contract.functions
                            if not f.is_constructor
                            for s in f.assignment_statements
                        )
                        if backward:
                            continue

                        findings.append(
                            self._finding(
                                function=exit_func,
                                source_map=source_map,
                                confidence=0.7,
                                explanation=(
                                    f"'{exit_func.name}' only works while {var.name} == {required}. "
                                    f"'{forward[0].name}' moves {var.name} to {other} with no function "
                                    f"moving it back to {required}."
                                ),
                                triggering_condition=(
                                    f"{var.name} transitions {required} -> {other} "
                                    f"(via {forward[0].name}) with no reverse transition."
                                ),
                                asset_lock_consequence=(
                                    f"'{exit_func.name}' becomes permanently unreachable for any "
                                    f"caller as soon as the state moves to {other}."
                                ),
                                remediation=(
                                    f"Provide an equivalent exit path reachable from state {other}, "
                                    f"or make the {required}->{other} transition reversible."
                                ),
                            )
                        )
        return findings
