"""The fund-flow/dependency graph shape consumed by the frontend's React
Flow view (packages/graph on the TS side). Nodes are functions; edges are
calls between them. Mirrors packages/graph/src/types.ts."""

from __future__ import annotations

from app.schemas.base import CamelModel

NodeRole = str  # "entry" | "exit" | "internal" | "constructor" | "blocked"


class GraphNode(CamelModel):
    id: str
    contract: str
    function: str
    role: NodeRole
    file: str = ""
    line_start: int = 0
    line_end: int = 0
    state_requirements: list[str] = []
    access_requirements: list[str] = []
    finding_ids: list[str] = []


class GraphEdge(CamelModel):
    id: str
    source: str
    target: str
    kind: str  # "internal" | "external" | "delegatecall"
    blocked: bool = False


class FundFlowGraph(CamelModel):
    nodes: list[GraphNode] = []
    edges: list[GraphEdge] = []
