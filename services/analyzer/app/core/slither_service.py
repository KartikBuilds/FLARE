"""Runs Slither against a compiled project and normalizes its output into
the ProjectIR every downstream stage (graph, detectors, risk) consumes.

Deliberately uses each node's string expression to detect selfdestruct /
delegatecall / transfer / require / assignment patterns rather than
chasing Slither's internal call-graph attribute names, which vary across
versions — a substring/text scan on the rendered expression is simpler and
more stable across the Slither versions this service is likely to run
against. Every detector in app/detectors/ consumes only the structured
fields this module produces, never Slither objects directly.
"""

from __future__ import annotations

import re
from concurrent.futures import ThreadPoolExecutor
from concurrent.futures import TimeoutError as FutureTimeoutError
from pathlib import Path

from app.config import settings
from app.schemas.ir import (
    CallIR,
    ContractIR,
    FunctionIR,
    ProjectIR,
    SourceLocation,
    StateVariableIR,
    TransferCallIR,
)


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


def _matching_paren(text: str, open_index: int) -> int:
    """Given the index of an opening '(' in text, returns the index of its
    matching ')' (depth-aware)."""
    depth = 0
    for i in range(open_index, len(text)):
        if text[i] == "(":
            depth += 1
        elif text[i] == ")":
            depth -= 1
            if depth == 0:
                return i
    return len(text) - 1


def _count_top_level_commas(text: str) -> int:
    depth = 0
    commas = 0
    for ch in text:
        if ch in "([{":
            depth += 1
        elif ch in ")]}":
            depth -= 1
        elif ch == "," and depth == 0:
            commas += 1
    return commas


_TRANSFER_METHOD_RE = re.compile(r"\.(transfer|send|transferFrom)\(")


def _expression_start(expr: str, dot_index: int) -> int:
    """Given the index of a '.' that starts a method call (e.g. in
    `x.transfer(...)`), walks left to find where the receiver expression
    itself begins — used both for delegatecall targets and for deciding
    whether a transfer call's result is captured by an assignment."""
    start = dot_index
    depth = 0
    while start > 0:
        c = expr[start - 1]
        if c in ")]":
            depth += 1
        elif c in "([":
            if depth == 0:
                break
            depth -= 1
        elif c in " \t;," and depth == 0:
            break
        start -= 1
    return start


def _extract_transfer_calls(expr: str) -> list[tuple[str, int, str, int]]:
    """Returns (method, arg_count, raw_call_text, receiver_start) for every
    .transfer(...)/.send(...)/.transferFrom(...) call in expr.
    `receiver_start` is where the receiver expression begins (e.g. the
    index of `token` in `token.transfer(...)`), used to look at what
    precedes the *whole* call, not just the `.transfer(` token."""
    results = []
    for match in _TRANSFER_METHOD_RE.finditer(expr):
        method = match.group(1)
        open_paren = match.end() - 1
        close_paren = _matching_paren(expr, open_paren)
        args_text = expr[open_paren + 1 : close_paren]
        arg_count = 0 if args_text.strip() == "" else _count_top_level_commas(args_text) + 1
        receiver_start = _expression_start(expr, match.start())
        raw = expr[receiver_start : close_paren + 1]
        results.append((method, arg_count, raw, receiver_start))
    return results


def _is_checked_transfer(expr: str, receiver_start: int) -> bool:
    """True if the transfer call is wrapped in require()/assert(), or its
    result is assigned to a variable — both indicate the caller checks the
    outcome rather than ignoring it."""
    if expr.lstrip().startswith(("require(", "assert(")):
        return True
    prefix = expr[:receiver_start].rstrip()
    # crude but effective: an assignment ("x = ") immediately before the
    # call, with no unrelated statement boundary, means the boolean result
    # is captured rather than discarded.
    if re.search(r"[A-Za-z_][A-Za-z0-9_]*\s*(=|\+=|-=)\s*$", prefix):
        return True
    return False


_ASSIGNMENT_RE = re.compile(r"^\s*([A-Za-z_][A-Za-z0-9_\[\]\.]*)\s*(=|\+=|-=)\s*[^=]")


def _scan_function_body(function, state_var_names: set[str]) -> dict:
    selfdestruct = delegatecall = low_level_transfer = False
    delegatecall_targets: list[str] = []
    requires: list[str] = []
    assigns_to: list[str] = []
    assignment_statements: list[str] = []
    transfer_calls: list[TransferCallIR] = []

    for node in getattr(function, "nodes", []) or []:
        expr = str(getattr(node, "expression", "") or "")
        if not expr:
            continue

        if "selfdestruct(" in expr or "suicide(" in expr:
            selfdestruct = True

        if ".delegatecall(" in expr:
            delegatecall = True
            idx = expr.index(".delegatecall(")
            # walk left from idx to find the start of the receiver expression
            start = idx
            depth = 0
            while start > 0:
                c = expr[start - 1]
                if c in ")]":
                    depth += 1
                elif c in "([":
                    if depth == 0:
                        break
                    depth -= 1
                elif c in " \t;," and depth == 0:
                    break
                start -= 1
            delegatecall_targets.append(expr[start:idx].strip())

        if expr.lstrip().startswith(("require(", "assert(")):
            requires.append(expr.strip())

        assign_match = _ASSIGNMENT_RE.match(expr)
        if assign_match:
            target = assign_match.group(1).split("[")[0].split(".")[0]
            if target in state_var_names:
                assigns_to.append(target)
                assignment_statements.append(expr.strip())

        for method, arg_count, raw, receiver_start in _extract_transfer_calls(expr):
            if method in ("transfer", "send"):
                low_level_transfer = True
            transfer_calls.append(
                TransferCallIR(
                    raw=raw[:200],
                    method=method,
                    arg_count=arg_count,
                    is_checked=_is_checked_transfer(expr, receiver_start),
                    source=_source_location(getattr(node, "source_mapping", None)),
                )
            )

    return {
        "selfdestruct": selfdestruct,
        "delegatecall": delegatecall,
        "low_level_transfer": low_level_transfer,
        "delegatecall_targets": delegatecall_targets,
        "requires": requires,
        "assigns_to": assigns_to,
        "assignment_statements": assignment_statements,
        "transfer_calls": transfer_calls,
    }


_LOW_LEVEL_CALL_RE = re.compile(r"\.(call|staticcall)[({]")


def _calls_for(function) -> list[CallIR]:
    calls: list[CallIR] = []
    for node in getattr(function, "nodes", []) or []:
        expr = str(getattr(node, "expression", "") or "")
        if ".delegatecall(" in expr:
            calls.append(CallIR(kind="delegatecall", target=expr[:200]))
        # `{...}` covers Solidity's call-options syntax, e.g.
        # `target.call{value: amount}("")` — the brace comes before the
        # parens, so a plain ".call(" substring check misses it entirely.
        elif _LOW_LEVEL_CALL_RE.search(expr):
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


def _function_ir(function, contract_name: str, state_var_names: set[str]) -> FunctionIR:
    signals = _scan_function_body(function, state_var_names)
    return FunctionIR(
        name=function.name,
        contract=contract_name,
        visibility=function.visibility,
        state_mutability=_mutability(function),
        modifiers=[m.name for m in getattr(function, "modifiers", [])],
        is_constructor=bool(getattr(function, "is_constructor", False)),
        calls=_calls_for(function),
        contains_selfdestruct=signals["selfdestruct"],
        contains_delegatecall=signals["delegatecall"],
        uses_low_level_transfer=signals["low_level_transfer"],
        delegatecall_targets=signals["delegatecall_targets"],
        requires=signals["requires"],
        assigns_to=signals["assigns_to"],
        assignment_statements=signals["assignment_statements"],
        transfer_calls=signals["transfer_calls"],
        source=_source_location(getattr(function, "source_mapping", None)),
    )


def _state_variable_ir(variable, contract_name: str, enum_names: dict[str, list[str]]) -> StateVariableIR:
    type_str = str(variable.type)
    enum_name = type_str.split(".")[-1]
    is_enum = enum_name in enum_names
    return StateVariableIR(
        name=variable.name,
        type=type_str,
        visibility=getattr(variable, "visibility", "internal"),
        contract=contract_name,
        is_enum=is_enum,
        enum_values=enum_names.get(enum_name, []) if is_enum else [],
    )


def _enum_names(contract) -> dict[str, list[str]]:
    result: dict[str, list[str]] = {}
    for enum in getattr(contract, "enums", []) or []:
        values = [getattr(v, "name", str(v)) for v in getattr(enum, "values", [])]
        result[enum.name] = values
    return result


def _contract_ir(contract) -> ContractIR:
    file = ""
    if contract.functions:
        loc = _source_location(getattr(contract.functions[0], "source_mapping", None))
        file = loc.file if loc else ""
    elif getattr(contract, "source_mapping", None):
        loc = _source_location(contract.source_mapping)
        file = loc.file if loc else ""

    enum_names = _enum_names(contract)
    state_vars = [
        _state_variable_ir(v, contract.name, enum_names) for v in getattr(contract, "state_variables", [])
    ]
    state_var_names = {v.name for v in state_vars}

    return ContractIR(
        name=contract.name,
        file=file,
        is_library=bool(getattr(contract, "is_library", False)),
        is_interface=bool(getattr(contract, "is_interface", False)),
        is_abstract=bool(getattr(contract, "is_abstract", False)),
        inherits=[c.name for c in getattr(contract, "inheritance", [])],
        state_variables=state_vars,
        functions=[
            _function_ir(f, contract.name, state_var_names) for f in getattr(contract, "functions", [])
        ],
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
