"use client";

import { useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  type Edge,
  type Node,
  type NodeProps,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { layoutGraph, type FundFlowGraph, type GraphNode } from "@flare/graph";
import { Badge, cn } from "@flare/ui";
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Ban, Wrench } from "lucide-react";

const ROLE_ICON: Record<GraphNode["role"], typeof ArrowDownToLine> = {
  entry: ArrowDownToLine,
  exit: ArrowUpFromLine,
  blocked: Ban,
  constructor: Wrench,
  internal: AlertTriangle,
};

const ROLE_STYLE: Record<GraphNode["role"], string> = {
  entry: "border-success text-success",
  exit: "border-ink text-ink",
  blocked: "border-danger text-danger",
  constructor: "border-line text-muted",
  internal: "border-line text-ink-soft",
};

function FlareNode({ data, selected }: NodeProps<GraphNode>) {
  const Icon = ROLE_ICON[data.role];
  return (
    <div
      className={cn(
        "rounded-[var(--radius-control)] border-2 bg-paper px-3.5 py-2.5 shadow-sm transition-shadow",
        ROLE_STYLE[data.role],
        selected && "shadow-md ring-2 ring-ink/20",
      )}
      style={{ minWidth: 160 }}
    >
      {/* Without explicit Handles, React Flow has no valid attachment
          point for a custom node and silently drops every edge touching
          it — invisible-but-connected, rather than an obvious bug. */}
      <Handle type="target" position={Position.Left} className="!bg-ink-soft" />
      <Handle type="source" position={Position.Right} className="!bg-ink-soft" />
      <div className="flex items-center gap-2">
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <span className="font-condensed text-[12px] font-semibold uppercase tracking-[0.03em]">
          {data.function}
        </span>
      </div>
      <p className="mt-0.5 truncate font-sans text-[11px] text-muted">{data.contract}</p>
      {data.findingIds.length > 0 && (
        <Badge tone={data.role === "blocked" ? "danger" : "warning"} className="mt-1.5">
          {data.findingIds.length} finding{data.findingIds.length === 1 ? "" : "s"}
        </Badge>
      )}
    </div>
  );
}

const nodeTypes = { flareNode: FlareNode };

interface AssetFlowGraphProps {
  graph: FundFlowGraph;
  onSelectNode?: (node: GraphNode | null) => void;
}

export function AssetFlowGraph({ graph, onSelectNode }: AssetFlowGraphProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => {
    const positioned = layoutGraph(graph);
    const nodes: Node<GraphNode>[] = positioned.map((n) => ({
      id: n.id,
      type: "flareNode",
      position: { x: n.x, y: n.y },
      data: n,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }));
    const edges: Edge[] = graph.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      animated: !e.blocked,
      style: e.blocked
        ? { stroke: "var(--color-danger)", strokeDasharray: "4 4", strokeWidth: 2 }
        : { stroke: "var(--color-ink-soft)", strokeWidth: 1.5 },
      label: e.blocked ? "blocked" : undefined,
      labelStyle: { fill: "var(--color-danger)", fontSize: 11, fontWeight: 600 },
    }));
    return { nodes, edges };
  }, [graph]);

  return (
    <div className="h-[480px] w-full overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper-flat">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => {
          setSelectedId(node.id);
          onSelectNode?.(node.data as GraphNode);
        }}
        onPaneClick={() => {
          setSelectedId(null);
          onSelectNode?.(null);
        }}
        fitView
        proOptions={{ hideAttribution: true }}
        minZoom={0.4}
        maxZoom={1.5}
      >
        <Background gap={20} size={1} color="var(--color-line)" />
        <Controls showInteractive={false} />
      </ReactFlow>
      <span className="sr-only" aria-live="polite">
        {selectedId ? `Selected node ${selectedId}` : "No node selected"}
      </span>
    </div>
  );
}
