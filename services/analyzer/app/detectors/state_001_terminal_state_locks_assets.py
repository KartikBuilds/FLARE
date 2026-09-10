"""FLARE-STATE-001 — Terminal state reachable with no working exit.

Evidence: an enum state variable's last-declared value ("terminal" by
convention — a finalized/closed/terminated phase) is reachable and has no
transition back out, the contract can hold assets (a payable function
exists), and every withdraw/redeem/claim-style function explicitly
excludes that terminal value in its own require() — meaning once the
contract reaches it, nothing can move assets out."""

from __future__ import annotations

import re

from app.detectors.base import Detector
from app.schemas.finding import Finding
from app.schemas.ir import ProjectIR

_EXIT_NAME_RE = re.compile(r"withdraw|redeem|claim", re.IGNORECASE)


def _excludes_value(requirement: str, var: str, value: str) -> bool:
    """True if the requirement explicitly rules the terminal value out —
    either `var != Enum.Value` directly, or `var == Enum.<some other
    value>` (equality to a specific non-terminal value also excludes the
    terminal one, since an enum can only hold one value at a time)."""
    normalized = requirement.replace(" ", "")
    if var not in normalized:
        return False
    if f"!={value}" in normalized:
        return True
    return "==" in normalized and value not in normalized


class TerminalStateLocksAssetsDetector(Detector):
    id = "FLARE-STATE-001"
    version = "1.0.0"
    name = "Terminal state reachable with non-zero assets"
    taxonomy = "state-transitions"
    default_severity = "critical"
    related_incident_ids = ["lido-stsol-2024"]

    def run(self, ir: ProjectIR, source_map: dict[str, str]) -> list[Finding]:
        findings: list[Finding] = []
        for contract in ir.contracts:
            accepts_value = any(f.state_mutability == "payable" for f in contract.functions)
            if not accepts_value:
                continue

            enum_vars = [v for v in contract.state_variables if v.is_enum and len(v.enum_values) >= 2]
            for var in enum_vars:
                terminal = var.enum_values[-1]

                sets_terminal = [
                    f
                    for f in contract.functions
                    if any(
                        var.name in s.replace(" ", "") and terminal in s.replace(" ", "")
                        for s in f.assignment_statements
                    )
                ]
                if not sets_terminal:
                    continue

                # The constructor's initial assignment (e.g. `state = State.Active`
                # in `constructor()`) is setup, not a reverse transition — only a
                # non-constructor function moving the variable back counts.
                reverses = any(
                    var.name in s.replace(" ", "")
                    and any(other in s.replace(" ", "") for other in var.enum_values[:-1])
                    for f in contract.functions
                    if not f.is_constructor
                    for s in f.assignment_statements
                )
                if reverses:
                    continue

                exit_funcs = [f for f in contract.functions if _EXIT_NAME_RE.search(f.name)]
                if not exit_funcs:
                    continue

                all_excluded = all(
                    any(_excludes_value(r, var.name, terminal) for r in f.requires) for f in exit_funcs
                )
                if not all_excluded:
                    continue

                findings.append(
                    self._finding(
                        function=sets_terminal[0],
                        source_map=source_map,
                        confidence=0.7,
                        explanation=(
                            f"'{var.name}' reaches its terminal value '{terminal}' via "
                            f"'{sets_terminal[0].name}' with no transition back, and every exit "
                            f"function ({', '.join(f.name for f in exit_funcs)}) explicitly excludes "
                            "that state."
                        ),
                        triggering_condition=(
                            f"{var.name} set to {terminal} with no reverse transition; all exit "
                            f"functions require {var.name} != {terminal}."
                        ),
                        asset_lock_consequence=(
                            "Once the terminal state is reached, every withdrawal path is "
                            "permanently disabled while the contract can still hold assets."
                        ),
                        remediation=(
                            "Add an exit function that remains callable in the terminal state, or a "
                            "governed transition back out of it."
                        ),
                    )
                )
        return findings
