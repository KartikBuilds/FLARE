"""FLARE-LIB-001 — Unprotected delegatecall to a mutable address.

Evidence: a function performs `<target>.delegatecall(...)` where `<target>`
is a state variable that some *other*, non-constructor function can
overwrite with no access-control guard (no modifier, and no require()
referencing `owner`/`msg.sender`)."""

from __future__ import annotations

from app.detectors.base import Detector
from app.schemas.finding import Finding
from app.schemas.ir import FunctionIR, ProjectIR


def _has_access_control(func: FunctionIR) -> bool:
    if func.modifiers:
        return True
    return any("owner" in r.lower() or "msg.sender" in r.lower() for r in func.requires)


class UnprotectedDelegatecallDetector(Detector):
    id = "FLARE-LIB-001"
    version = "1.0.0"
    name = "Unprotected delegatecall to a mutable address"
    taxonomy = "library-dependencies"
    default_severity = "critical"
    related_incident_ids = ["parity-multisig-2017"]

    def run(self, ir: ProjectIR, source_map: dict[str, str]) -> list[Finding]:
        findings: list[Finding] = []
        for contract in ir.contracts:
            state_var_names = {v.name for v in contract.state_variables}
            for func in contract.functions:
                for target in func.delegatecall_targets:
                    if target not in state_var_names:
                        continue
                    setters = [
                        f for f in contract.functions if target in f.assigns_to and not f.is_constructor
                    ]
                    unprotected = [f for f in setters if not _has_access_control(f)]
                    if not unprotected:
                        continue
                    setter_names = ", ".join(sorted({f.name for f in unprotected}))
                    findings.append(
                        self._finding(
                            function=func,
                            source_map=source_map,
                            confidence=0.8,
                            explanation=(
                                f"'{func.name}' delegatecalls to '{target}', a state variable that "
                                f"'{setter_names}' can overwrite with no access-control check."
                            ),
                            triggering_condition=(
                                f"{target}.delegatecall(...) where {target} is set by an unguarded "
                                f"function ({setter_names})."
                            ),
                            asset_lock_consequence=(
                                "Any value or logic depending on the delegatecall target can be "
                                "redirected or bricked by whoever calls the unguarded setter, "
                                "including pointing it at a self-destructible or malicious contract."
                            ),
                            remediation=(
                                "Restrict the setter to an access-controlled role (e.g. onlyOwner), "
                                "or make the delegatecall target immutable after construction."
                            ),
                        )
                    )
        return findings
