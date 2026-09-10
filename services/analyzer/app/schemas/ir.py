"""The normalized intermediate representation every downstream stage
(dependency graph, detectors, risk scoring) reads — never Slither's own
objects directly, so detector code doesn't depend on Slither's internal
API shape. Mirrors the shapes documented in docs/ARCHITECTURE.md."""

from __future__ import annotations

from pydantic import BaseModel


class SourceLocation(BaseModel):
    file: str
    line_start: int
    line_end: int


class CallIR(BaseModel):
    kind: str  # "internal" | "external" | "delegatecall" | "library" | "low_level"
    target: str
    source: SourceLocation | None = None


class StateVariableIR(BaseModel):
    name: str
    type: str
    visibility: str
    contract: str


class FunctionIR(BaseModel):
    name: str
    contract: str
    visibility: str
    state_mutability: str  # "payable" | "view" | "pure" | "nonpayable"
    modifiers: list[str] = []
    is_constructor: bool = False
    calls: list[CallIR] = []
    contains_selfdestruct: bool = False
    contains_delegatecall: bool = False
    uses_low_level_transfer: bool = False  # .transfer()/.send() specifically
    source: SourceLocation | None = None


class ContractIR(BaseModel):
    name: str
    file: str
    is_library: bool = False
    is_interface: bool = False
    is_abstract: bool = False
    inherits: list[str] = []
    state_variables: list[StateVariableIR] = []
    functions: list[FunctionIR] = []


class ProjectIR(BaseModel):
    solc_version: str
    contracts: list[ContractIR] = []
    compile_warnings: list[str] = []
