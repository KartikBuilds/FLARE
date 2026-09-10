"""FLARE-XFER-001 — Unchecked return value from transfer/transferFrom.

Evidence: an ERC-20-shaped `.transfer(to, amount)` or
`.transferFrom(from, to, amount)` call (2-3 arguments, distinguishing it
from a native ETH `.transfer(amount)`) whose boolean return value is
neither passed to require()/assert() nor assigned — a non-reverting token
that returns `false` on failure would silently be treated as a success."""

from __future__ import annotations

from app.detectors.base import Detector
from app.schemas.finding import Finding
from app.schemas.ir import ProjectIR


class UncheckedTransferReturnDetector(Detector):
    id = "FLARE-XFER-001"
    version = "1.0.0"
    name = "Unchecked return value from transfer/transferFrom"
    taxonomy = "transfer-logic"
    default_severity = "high"

    def run(self, ir: ProjectIR, source_map: dict[str, str]) -> list[Finding]:
        findings: list[Finding] = []
        for contract in ir.contracts:
            for func in contract.functions:
                for i, call in enumerate(func.transfer_calls):
                    if call.arg_count < 2:
                        continue  # native ETH transfer — FLARE-XFER-002's territory
                    if call.is_checked:
                        continue
                    findings.append(
                        self._finding(
                            function=func,
                            source_map=source_map,
                            confidence=0.7,
                            explanation=(
                                f"'{func.name}' calls `{call.raw}` without checking its boolean "
                                "return value."
                            ),
                            triggering_condition=call.raw,
                            asset_lock_consequence=(
                                "A token that returns false instead of reverting on failure (common "
                                "among non-standard ERC-20s) would silently fail here — the caller's "
                                "accounting proceeds as if the transfer succeeded, while the asset "
                                "never actually moved."
                            ),
                            remediation=(
                                "Wrap the call in require(...), or use a safe-transfer helper (e.g. "
                                "OpenZeppelin's SafeERC20) that reverts on a false return."
                            ),
                            index=i,
                        )
                    )
        return findings
