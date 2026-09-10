"""Builds the fund-flow/dependency graph from a ProjectIR using NetworkX —
nodes are functions, edges are calls between them. Every node/edge in the
exported FundFlowGraph is derived from the same IR the detectors read;
nothing here is inferred beyond what Slither's output actually shows."""

from __future__ import annotations

import re

import networkx as nx

from app.schemas.finding import Finding
from app.schemas.graph import FundFlowGraph, GraphEdge, GraphNode
from app.schemas.ir import FunctionIR, ProjectIR

_EXIT_NAME_RE = re.compile(r"withdraw|redeem|claim|rescue|recover", re.IGNORECASE)

# Taxonomy categories whose findings represent a broken/unreachable exit —
# a node touched by one of these is drawn as "blocked" in the UI, with its
# incoming/outgoing edges rendered as visually interrupted.
_BLOCKING_TAXONOMY = {"withdrawal-failures", "state-transitions"}


def _node_id(contract: str, function: str) -> str:
    return f"{contract}.{function}"


def _classify_role(func: FunctionIR, blocked_node_ids: set[str]) -> str:
    node_id = _node_id(func.contract, func.name)
    if node_id in blocked_node_ids:
        return "blocked"
    if func.is_constructor:
        return "constructor"
    if func.state_mutability == "payable" and not _EXIT_NAME_RE.search(func.name):
        return "entry"
    if _EXIT_NAME_RE.search(func.name):
        return "exit"
    return "internal"


def build_fund_flow_graph(ir: ProjectIR, findings: list[Finding]) -> FundFlowGraph:
    blocked_node_ids: set[str] = set()
    findings_by_node: dict[str, list[str]] = {}
    for finding in findings:
        if finding.taxonomy not in _BLOCKING_TAXONOMY:
            continue
        # Findings key on file/line, not directly on a function id — recover
        # the function by matching the finding's source location back to a
        # function in the same contract-scoped file.
        for contract in ir.contracts:
            for func in contract.functions:
                if (
                    func.source
                    and finding.file == func.source.file
                    and func.source.line_start <= finding.line_start <= func.source.line_end
                ):
                    node_id = _node_id(contract.name, func.name)
                    blocked_node_ids.add(node_id)
                    findings_by_node.setdefault(node_id, []).append(finding.id)

    graph = nx.DiGraph()
    all_function_names: dict[str, list[str]] = {}  # function name -> [node_ids] across contracts

    for contract in ir.contracts:
        for func in contract.functions:
            node_id = _node_id(contract.name, func.name)
            role = _classify_role(func, blocked_node_ids)
            graph.add_node(
                node_id,
                contract=contract.name,
                function=func.name,
                role=role,
                file=func.source.file if func.source else "",
                line_start=func.source.line_start if func.source else 0,
                line_end=func.source.line_end if func.source else 0,
                state_requirements=func.requires,
                access_requirements=[m for m in func.modifiers],
                finding_ids=findings_by_node.get(node_id, []),
            )
            all_function_names.setdefault(func.name, []).append(node_id)

    for contract in ir.contracts:
        for func in contract.functions:
            source_id = _node_id(contract.name, func.name)
            for call in func.calls:
                if call.kind == "internal":
                    # internal_calls report a signature like "foo(uint256)" —
                    # match by name prefix against this contract's functions.
                    target_name = call.target.split("(")[0]
                    target_id = _node_id(contract.name, target_name)
                    if graph.has_node(target_id) and target_id != source_id:
                        blocked = target_id in blocked_node_ids or source_id in blocked_node_ids
                        graph.add_edge(source_id, target_id, kind="internal", blocked=blocked)
                elif call.kind in ("external", "delegatecall"):
                    target_name = call.target.split("(")[0]
                    candidates = [n for n in all_function_names.get(target_name, []) if n != source_id]
                    for target_id in candidates:
                        blocked = target_id in blocked_node_ids or source_id in blocked_node_ids
                        graph.add_edge(source_id, target_id, kind=call.kind, blocked=blocked)

    nodes = [
        GraphNode(
            id=node_id,
            contract=data["contract"],
            function=data["function"],
            role=data["role"],
            file=data["file"],
            line_start=data["line_start"],
            line_end=data["line_end"],
            state_requirements=data["state_requirements"],
            access_requirements=data["access_requirements"],
            finding_ids=data["finding_ids"],
        )
        for node_id, data in graph.nodes(data=True)
    ]
    edges = [
        GraphEdge(
            id=f"{u}->{v}",
            source=u,
            target=v,
            kind=data["kind"],
            blocked=data["blocked"],
        )
        for u, v, data in graph.edges(data=True)
    ]
    return FundFlowGraph(nodes=nodes, edges=edges)
