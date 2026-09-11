import { z } from "zod";
import { FundFlowGraph } from "@flare/graph";
import { TaxonomyCategoryId } from "./taxonomy";

export const Severity = z.enum(["critical", "high", "medium", "low"]);
export type Severity = z.infer<typeof Severity>;

export const RiskBand = z.enum(["critical", "high", "medium", "low", "minimal"]);
export type RiskBand = z.infer<typeof RiskBand>;

export const AnalysisStatus = z.enum([
  "queued",
  "intake",
  "compiling",
  "analyzing",
  "detecting",
  "validating",
  "scoring",
  "complete",
  "failed",
]);
export type AnalysisStatus = z.infer<typeof AnalysisStatus>;

export const DataOrigin = z.enum(["demo", "live"]);
export type DataOrigin = z.infer<typeof DataOrigin>;

export const Reachability = z.enum(["public", "privileged", "theoretical"]);
export type Reachability = z.infer<typeof Reachability>;

export const Finding = z.object({
  id: z.string(),
  detectorId: z.string(),
  detectorVersion: z.string(),
  title: z.string(),
  taxonomy: TaxonomyCategoryId,
  severity: Severity,
  confidence: z.number().min(0).max(1),
  reachability: Reachability.default("theoretical"),
  file: z.string(),
  lineStart: z.number().int(),
  lineEnd: z.number().int(),
  codeExcerpt: z.string(),
  explanation: z.string(),
  triggeringCondition: z.string(),
  assetLockConsequence: z.string(),
  remediation: z.string(),
  relatedIncidentIds: z.array(z.string()).default([]),
  validated: z.boolean(),
  falsePositiveSuppressed: z.boolean().default(false),
  suppressionReason: z.string().optional(),
});
export type Finding = z.infer<typeof Finding>;

export const SeverityCounts = z.object({
  critical: z.number().int().default(0),
  high: z.number().int().default(0),
  medium: z.number().int().default(0),
  low: z.number().int().default(0),
});
export type SeverityCounts = z.infer<typeof SeverityCounts>;

export const FindingScoreBreakdown = z.object({
  findingId: z.string(),
  severityWeight: z.number(),
  confidence: z.number(),
  reachability: Reachability,
  reachabilityWeight: z.number(),
  assetExposure: z.number(),
  dependencyCriticality: z.number(),
  recoveryOffset: z.number(),
  validated: z.boolean(),
  contribution: z.number(),
});
export type FindingScoreBreakdown = z.infer<typeof FindingScoreBreakdown>;

export const AnalysisSummary = z.object({
  id: z.string(),
  origin: DataOrigin,
  projectName: z.string(),
  projectVersion: z.string(),
  status: AnalysisStatus,
  createdAt: z.string(),
  flareScore: z.number().min(0).max(100).nullable(),
  riskBand: RiskBand.nullable(),
  formulaVersion: z.string().nullable().default(null),
  coverage: z.number().min(0).max(1).nullable(),
  coverageNotes: z.array(z.string()).default([]),
  scoreBreakdown: z.array(FindingScoreBreakdown).default([]),
  findingCount: z.number().int(),
  severityCounts: SeverityCounts,
  error: z.string().nullable().default(null),
  findings: z.array(Finding).default([]),
  graph: FundFlowGraph.nullable().default(null),
});
export type AnalysisSummary = z.infer<typeof AnalysisSummary>;
