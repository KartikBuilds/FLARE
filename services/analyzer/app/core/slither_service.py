"""Runs Slither against a compiled project and normalizes its output into
the ProjectIR every downstream stage (graph, detectors, risk) consumes.

Deliberately uses each node's string expression to detect selfdestruct /
delegatecall / low-level-transfer patterns rather than chasing Slither's
internal call-graph attribute names, which vary across versions — a
substring check on the rendered expression is simpler and more stable
across the Slither versions this service is likely to run against.
"""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from concurrent.futures import TimeoutError as FutureTimeoutError
from pathlib import Path

from app.config import settings
from app.schemas.ir import CallIR, ContractIR, FunctionIR, ProjectIR, SourceLocation, StateVariableIR


class SlitherAnalysisError(RuntimeError):
    """Raised when Slither itself fails or times out. Distinct from
    CompileError so callers can tell "didn't compile" apart from "compiled
    but Slither's own analysis failed"."""


def _run_with_timeout(fn, seconds: int):
    """Runs fn() with a wall-clock timeout. Unlike signal.alarm, this works
    from any thread — required because FastAPI/anyio can run sync endpoint
    code off the main thread, where SIGALRM cannot be installed at all.
    On timeout the pool is shut down without waiting (Python can't
    force-kill a thread), so the caller is unblocked immediately, which is
    what actually matters for bounding one request's latency."""
    if seconds <= 0:
        return fn()
    pool = ThreadPoolExecutor(max_workers=1)
    future = pool.submit(fn)
    try:
        return future.result(timeout=seconds)
    except FutureTimeoutError as exc:
        pool.shutdown(wait=False, cancel_futures=True)
        raise SlitherAnalysisError(f"Slither analysis timed out after {seconds}s.") from exc
    else:
        pool.shutdown(wait=False)


def _source_location(source_mapping) -> SourceLocation | None:
    if source_mapping is None:
        return None
    try:
        filename = source_mapping.filename.relative or source_mapping.filename.short
        lines = source_mapping.lines
        if not lines:
            return None
        return SourceLocation(file=filename, line_start=lines[0], line_end=lines[-1])
    except AttributeError:
        return None


def _mutability(function) -> str:
    if getattr(function, "payable", False):
        return "payable"
    if getattr(function, "view", False):
        return "view"
    if getattr(function, "pure", False):
        return "pure"
    return "nonpayable"


def _scan_function_body(function) -> tuple[bool, bool, bool]:
    """Returns (contains_selfdestruct, contains_delegatecall, uses_low_level_transfer)."""
    selfdestruct = delegatecall = low_level_transfer = False
    for node in getattr(function, "nodes", []) or []:
        expr = str(getattr(node, "expression", "") or "")
        if "selfdestruct(" in expr or "suicide(" in expr:
            selfdestruct = True
        if ".delegatecall(" in expr:
            delegatecall = True
        if ".transfer(" in expr or ".send(" in expr:
            low_level_transfer = True
    return selfdestruct, delegatecall, low_level_transfer


def _calls_for(function) -> list[CallIR]:
    calls: list[CallIR] = []
    for node in getattr(function, "nodes", []) or []:
        expr = str(getattr(node, "expression", "") or "")
        if ".delegatecall(" in expr:
            calls.append(CallIR(kind="delegatecall", target=expr[:200]))
        elif ".call(" in expr or ".staticcall(" in expr:
            calls.append(CallIR(kind="low_level", target=expr[:200]))
    for internal in getattr(function, "internal_calls", []) or []:
        name = getattr(internal, "name", str(internal))
        calls.append(CallIR(kind="internal", target=name))
    for high_level in getattr(function, "high_level_calls", []) or []:
        try:
            _, called_function = high_level
            name = getattr(called_function, "name", str(called_function))
        except (TypeError, ValueError):
            name = str(high_level)
        calls.append(CallIR(kind="external", target=name))
    return calls


def _function_ir(function, contract_name: str) -> FunctionIR:
    selfdestruct, delegatecall, low_level_transfer = _scan_function_body(function)
    return FunctionIR(
        name=function.name,
        contract=contract_name,
        visibility=function.visibility,
        state_mutability=_mutability(function),
        modifiers=[m.name for m in getattr(function, "modifiers", [])],
        is_constructor=bool(getattr(function, "is_constructor", False)),
        calls=_calls_for(function),
        contains_selfdestruct=selfdestruct,
        contains_delegatecall=delegatecall,
        uses_low_level_transfer=low_level_transfer,
        source=_source_location(getattr(function, "source_mapping", None)),
    )


def _state_variable_ir(variable, contract_name: str) -> StateVariableIR:
    return StateVariableIR(
        name=variable.name,
        type=str(variable.type),
        visibility=getattr(variable, "visibility", "internal"),
        contract=contract_name,
    )


def _contract_ir(contract) -> ContractIR:
    file = ""
    if contract.functions:
        loc = _source_location(getattr(contract.functions[0], "source_mapping", None))
        file = loc.file if loc else ""
    elif getattr(contract, "source_mapping", None):
        loc = _source_location(contract.source_mapping)
        file = loc.file if loc else ""

    return ContractIR(
        name=contract.name,
        file=file,
        is_library=bool(getattr(contract, "is_library", False)),
        is_interface=bool(getattr(contract, "is_interface", False)),
        is_abstract=bool(getattr(contract, "is_abstract", False)),
        inherits=[c.name for c in getattr(contract, "inheritance", [])],
        state_variables=[
            _state_variable_ir(v, contract.name) for v in getattr(contract, "state_variables", [])
        ],
        functions=[_function_ir(f, contract.name) for f in getattr(contract, "functions", [])],
    )


def run_slither(files: list[Path], solc_version: str) -> ProjectIR:
    """`files` are the .sol files already validated by intake and
    successfully compiled by core.compiler.compile_check. crytic-compile's
    standalone-solc platform wants an explicit file (or comma-joined list
    of files), not a bare directory — a directory is only accepted when it
    contains a recognized framework config (foundry.toml, hardhat.config.js
    etc.), which an arbitrary upload won't have."""
    from slither import Slither  # imported lazily: heavy, and only needed here
    from slither.exceptions import SlitherError

    target = ",".join(str(f) for f in files)

    try:
        sl = _run_with_timeout(lambda: Slither(target), settings.slither_timeout_seconds)
    except SlitherError as exc:
        raise SlitherAnalysisError(f"Slither could not analyze this project: {exc}") from exc

    contracts = [_contract_ir(c) for c in sl.contracts]
    return ProjectIR(solc_version=solc_version, contracts=contracts)
