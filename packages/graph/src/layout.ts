import type { FundFlowGraph, GraphNode } from "./types";

export interface PositionedNode extends GraphNode {
  x: number;
  y: number;
}

const COLUMN_WIDTH = 260;
const ROW_HEIGHT = 120;

/**
 * A small, dependency-free layered layout: BFS depth from every
 * entry/constructor node decides the column, and nodes within a column are
 * stacked vertically. Good enough for the modest, single-contract-scale
 * graphs FLARE renders — not a general-purpose graph layout algorithm.
 */
export function layoutGraph(graph: FundFlowGraph): PositionedNode[] {
  const adjacency = new Map<string, string[]>();
  for (const node of graph.nodes) adjacency.set(node.id, []);
  for (const edge of graph.edges) {
    adjacency.get(edge.source)?.push(edge.target);
  }

  const depth = new Map<string, number>();
  const roots = graph.nodes.filter((n) => n.role === "entry" || n.role === "constructor");
  const queue: string[] = [];

  for (const root of roots) {
    depth.set(root.id, 0);
    queue.push(root.id);
  }
  // Any node unreached from a root still needs a column — seed remaining
  // nodes at depth 0 too so nothing is left unpositioned.
  for (const node of graph.nodes) {
    if (!depth.has(node.id)) {
      depth.set(node.id, 0);
      queue.push(node.id);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDepth = depth.get(current) ?? 0;
    for (const next of adjacency.get(current) ?? []) {
      const existing = depth.get(next);
      if (existing === undefined || existing < currentDepth + 1) {
        depth.set(next, currentDepth + 1);
        queue.push(next);
      }
    }
  }

  const columns = new Map<number, string[]>();
  for (const node of graph.nodes) {
    const d = depth.get(node.id) ?? 0;
    const list = columns.get(d) ?? [];
    list.push(node.id);
    columns.set(d, list);
  }

  const positionById = new Map<string, { x: number; y: number }>();
  for (const [d, ids] of columns.entries()) {
    ids.forEach((id, i) => {
      positionById.set(id, { x: d * COLUMN_WIDTH, y: i * ROW_HEIGHT });
    });
  }

  return graph.nodes.map((node) => ({
    ...node,
    x: positionById.get(node.id)?.x ?? 0,
    y: positionById.get(node.id)?.y ?? 0,
  }));
}
