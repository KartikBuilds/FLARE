"""FLARE-XFER-002 — Fixed-gas-stipend transfer incompatible with the
deployment chain.

Evidence: a native ETH `.transfer(amount)` / `.send(amount)` call (1
argument — the fixed ~2300 gas stipend Solidity forwards) with no
call()-based fallback. This is safe on plain Ethereum L1 but has caused
real fund-locks on L2s/proxies where 2300 gas is insufficient for the
recipient's own logic to complete (see the Gemholic case study)."""

from __future__ import annotations

from app.detectors.base import Detector
from app.schemas.finding import Finding
from app.schemas.ir import ProjectIR


class FixedGasStipendTransferDetector(Detector):
    id = "FLARE-XFER-002"
    version = "1.0.0"
    name = "Fixed-gas-stipend transfer incompatible with the deployment chain"
    taxonomy = "transfer-logic"
    default_severity = "high"
    related_incident_ids = ["gemholic-zksync-2023"]

    def run(self, ir: ProjectIR, source_map: dict[str, str]) -> list[Finding]:
        findings: list[Finding] = []
        for contract in ir.contracts:
            for func in contract.functions:
                has_call_fallback = any(c.kind == "low_level" for c in func.calls)
                for i, call in enumerate(func.transfer_calls):
                    if call.arg_count != 1:
                        continue  # ERC-20-shaped call — FLARE-XFER-001's territory
                    if has_call_fallback:
                        continue
                    findings.append(
                        self._finding(
                            function=func,
                            source_map=source_map,
                            confidence=0.55,
                            explanation=(
                                f"'{func.name}' moves ETH with `{call.raw}`, which forwards a fixed "
                                "~2300 gas stipend and has no call()-based fallback."
                            ),
                            triggering_condition=call.raw,
                            asset_lock_consequence=(
                                "On a chain or through a proxy where 2300 gas is insufficient for the "
                                "recipient to complete its own logic, this transfer always reverts — "
                                "with no alternative path, the sender's funds cannot reach that "
                                "recipient at all."
                            ),
                            remediation=(
                                "Use a call()-based transfer with an explicit success check instead "
                                "of the fixed-stipend .transfer()/.send(), or document and test the "
                                "target chain's gas-forwarding behavior explicitly."
                            ),
                            index=i,
                        )
                    )
        return findings
