"""FLARE-WD-002 — Unreachable withdrawal branch.

Evidence: a withdraw/redeem-style function requires a boolean state
variable to be truthy, but no function in the contract ever sets that
variable to true — the branch exists in source but no sequence of calls
can ever reach it."""

from __future__ import annotations

import re

from app.detectors.base import Detector
from app.schemas.finding import Finding
from app.schemas.ir import ProjectIR

_EXIT_NAME_RE = re.compile(r"withdraw|redeem|claim", re.IGNORECASE)


def _sets_true(statements: list[str], var: str) -> bool:
    normalized = [s.replace(" ", "") for s in statements]
    return any(s == f"{var}=true" or s.startswith(f"{var}=true") for s in normalized)


class UnreachableWithdrawalBranchDetector(Detector):
    id = "FLARE-WD-002"
    version = "1.0.0"
    name = "Unreachable withdrawal branch"
    taxonomy = "withdrawal-failures"
    default_severity = "high"

    def run(self, ir: ProjectIR, source_map: dict[str, str]) -> list[Finding]:
        findings: list[Finding] = []
        for contract in ir.contracts:
            bool_vars = {v.name for v in contract.state_variables if v.type == "bool"}
            if not bool_vars:
                continue

            any_setter_true = {var: False for var in bool_vars}
            for f in contract.functions:
                for var in bool_vars:
                    if _sets_true(f.assignment_statements, var):
                        any_setter_true[var] = True

            for func in contract.functions:
                if not _EXIT_NAME_RE.search(func.name):
                    continue
                for i, req in enumerate(func.requires):
                    normalized = req.replace(" ", "")
                    for var in bool_vars:
                        if var not in normalized or f"!{var}" in normalized:
                            continue
                        if any_setter_true[var]:
                            continue
                        findings.append(
                            self._finding(
                                function=func,
                                source_map=source_map,
                                confidence=0.75,
                                explanation=(
                                    f"'{func.name}' requires '{var}' to be true, but no function in "
                                    f"'{contract.name}' ever sets '{var} = true'."
                                ),
                                triggering_condition=req,
                                asset_lock_consequence=(
                                    f"This withdrawal path is dead code — it can never execute "
                                    f"because '{var}' has no path to becoming true."
                                ),
                                remediation=(
                                    f"Add a function (with appropriate access control) that sets "
                                    f"'{var} = true' under the intended condition, or remove the "
                                    "dead branch if it was never meant to be reachable."
                                ),
                                index=i,
                            )
                        )
        return findings
