import { z } from "zod";

export const NodeRole = z.enum(["entry", "exit", "internal", "constructor", "blocked"]);
export type NodeRole = z.infer<typeof NodeRole>;

export const GraphNode = z.object({
  id: z.string(),
  contract: z.string(),
  function: z.string(),
  role: NodeRole,
  file: z.string().default(""),
  lineStart: z.number().int().default(0),
  lineEnd: z.number().int().default(0),
  stateRequirements: z.array(z.string()).default([]),
  accessRequirements: z.array(z.string()).default([]),
  findingIds: z.array(z.string()).default([]),
});
export type GraphNode = z.infer<typeof GraphNode>;

export const EdgeKind = z.enum(["internal", "external", "delegatecall"]);
export type EdgeKind = z.infer<typeof EdgeKind>;

export const GraphEdge = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  kind: EdgeKind,
  blocked: z.boolean().default(false),
});
export type GraphEdge = z.infer<typeof GraphEdge>;

export const FundFlowGraph = z.object({
  nodes: z.array(GraphNode).default([]),
  edges: z.array(GraphEdge).default([]),
});
export type FundFlowGraph = z.infer<typeof FundFlowGraph>;
