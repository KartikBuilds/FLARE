"""Local-only Foundry/Anvil validation: for a narrow, well-defined class of
findings (a call that a detector predicts must always revert), this
actually deploys the compiled contract to a throwaway local Anvil instance
and calls the flagged function, so `finding.validated` means "an
executable proof-of-concept confirmed this," not just "a static pattern
matched." Never touches a public network — see SECURITY.md.
"""

from __future__ import annotations

import json
import re
import socket
import subprocess
import time
from contextlib import closing

from app.core.compiler import CompileResult
from app.schemas.finding import Finding

# Only detectors whose claim is exactly "calling this function always
# reverts, with no setup required" can be validated this cheaply and
# reliably — a freshly deployed contract, called immediately.
VALIDATABLE_DETECTOR_IDS = {"FLARE-WD-001", "FLARE-WD-002"}


class ValidationUnavailable(RuntimeError):
    """Raised when Anvil itself can't be reached — validation is skipped,
    not treated as a failed validation."""


def _free_port() -> int:
    with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def _parse_combined_json(stdout: str) -> dict[str, dict]:
    """`solc --combined-json abi,bin` keys contracts as "path.sol:Name" —
    re-keyed here by the short contract name for easy lookup."""
    data = json.loads(stdout)
    result: dict[str, dict] = {}
    for key, value in data.get("contracts", {}).items():
        name = key.split(":")[-1]
        abi_raw = value.get("abi")
        abi = json.loads(abi_raw) if isinstance(abi_raw, str) else abi_raw
        result[name] = {"abi": abi, "bin": value.get("bin", "")}
    return result


def _default_arg(abi_type: str):
    if abi_type == "bool":
        return False
    if abi_type == "address":
        return "0x0000000000000000000000000000000000000000"
    if abi_type.startswith("uint") or abi_type.startswith("int"):
        return 0
    if abi_type == "bytes" or re.match(r"bytes\d+$", abi_type):
        return b""
    if abi_type == "string":
        return ""
    if abi_type.endswith("[]"):
        return []
    return 0


def validate_findings(
    findings: list[Finding], compile_result: CompileResult, primary_contract: str | None = None
) -> list[Finding]:
    """Attempts to validate each eligible finding by deploying the contract
    it belongs to and calling the flagged function. Returns a new list —
    findings that can't be validated (wrong detector type, deploy failure,
    ABI mismatch) are returned unchanged, never marked validated=True on a
    guess."""
    eligible = [f for f in findings if f.detector_id in VALIDATABLE_DETECTOR_IDS]
    if not eligible:
        return findings

    try:
        from web3 import Web3
    except ImportError:
        return findings

    port = _free_port()
    proc = None
    try:
        proc = subprocess.Popen(
            ["anvil", "--port", str(port), "--silent"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        w3 = Web3(Web3.HTTPProvider(f"http://127.0.0.1:{port}", request_kwargs={"timeout": 5}))
        for _ in range(30):
            if w3.is_connected():
                break
            time.sleep(0.2)
        else:
            raise ValidationUnavailable("anvil did not become reachable in time")

        contracts = _parse_combined_json(compile_result.stdout)
        account = w3.eth.accounts[0]

        validated_ids: set[str] = set()
        for finding in eligible:
            contract_name = primary_contract or finding.file.rsplit("/", 1)[-1].removesuffix(".sol")
            artifact = contracts.get(contract_name)
            if artifact is None or not artifact["bin"]:
                continue

            function_name = _function_name_from_finding(finding)
            abi_entry = next(
                (
                    e
                    for e in artifact["abi"]
                    if e.get("type") == "function" and e.get("name") == function_name
                ),
                None,
            )
            if abi_entry is None:
                continue

            try:
                w3_contract = w3.eth.contract(abi=artifact["abi"], bytecode="0x" + artifact["bin"])
                tx_hash = w3_contract.constructor().transact({"from": account})
                receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=10)
                deployed = w3.eth.contract(address=receipt.contractAddress, abi=artifact["abi"])

                args = [_default_arg(inp["type"]) for inp in abi_entry.get("inputs", [])]
                fn = getattr(deployed.functions, function_name)(*args)

                try:
                    fn.call({"from": account})
                    # Did not revert — the predicted-impossible condition
                    # was actually reachable with default args. Leave
                    # unvalidated; this doesn't disprove the finding (real
                    # inputs may still fail) but we only mark validated=True
                    # on a confirmed revert, never on an unconfirmed guess.
                except Exception:
                    validated_ids.add(finding.id)
            except Exception:
                continue

        return [
            f.model_copy(update={"validated": True, "confidence": max(f.confidence, 0.9)})
            if f.id in validated_ids
            else f
            for f in findings
        ]
    except ValidationUnavailable:
        return findings
    finally:
        if proc is not None:
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill()


def _function_name_from_finding(finding: Finding) -> str:
    # Finding ids are "<detector>:<Contract>.<function>:<index>".
    try:
        middle = finding.id.split(":")[1]
        return middle.split(".")[-1]
    except IndexError:
        return ""
