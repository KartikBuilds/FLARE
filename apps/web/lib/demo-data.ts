import type { AnalysisSummary, TaxonomyCategoryId } from "@flare/schemas";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

/**
 * Fixture analyses shown on the dashboard until services/analyzer exists
 * (Milestone 5+). Every record carries origin: "demo" — the UI renders a
 * visible DEMO badge for these and only swaps to LIVE ENGINE once a real
 * analysis is fetched from the API (see lib/engine-status.ts).
 */
export const DEMO_ANALYSES: AnalysisSummary[] = [
  {
    id: "demo-vaultline",
    origin: "demo",
    projectName: "VaultLine",
    projectVersion: "v1.0.0",
    status: "complete",
    createdAt: daysAgo(2),
    flareScore: 82,
    riskBand: "high",
    coverage: 0.91,
    findingCount: 7,
    severityCounts: { critical: 1, high: 2, medium: 2, low: 2 },
  },
  {
    id: "demo-meridian",
    origin: "demo",
    projectName: "Meridian",
    projectVersion: "v2.1.0",
    status: "complete",
    createdAt: daysAgo(5),
    flareScore: 47,
    riskBand: "medium",
    coverage: 0.88,
    findingCount: 3,
    severityCounts: { critical: 0, high: 1, medium: 1, low: 1 },
  },
  {
    id: "demo-orbit",
    origin: "demo",
    projectName: "Orbit",
    projectVersion: "v1.3.2",
    status: "complete",
    createdAt: daysAgo(7),
    flareScore: 38,
    riskBand: "medium",
    coverage: 0.95,
    findingCount: 4,
    severityCounts: { critical: 0, high: 1, medium: 2, low: 1 },
  },
  {
    id: "demo-northbridge",
    origin: "demo",
    projectName: "Northbridge",
    projectVersion: "v0.4.0",
    status: "complete",
    createdAt: daysAgo(21),
    flareScore: 22,
    riskBand: "low",
    coverage: 0.79,
    findingCount: 2,
    severityCounts: { critical: 0, high: 0, medium: 1, low: 1 },
  },
];

export function getDemoRiskDistribution(): Record<"critical" | "high" | "medium" | "low", number> {
  return DEMO_ANALYSES.reduce(
    (acc, a) => {
      acc.critical += a.severityCounts.critical ?? 0;
      acc.high += a.severityCounts.high ?? 0;
      acc.medium += a.severityCounts.medium ?? 0;
      acc.low += a.severityCounts.low ?? 0;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 },
  );
}

/** Demo-only taxonomy breakdown for the dashboard widget — aggregate
 * counts, not derived from individual finding fixtures (those don't exist
 * until the benchmark suite/real findings do). */
export const DEMO_TAXONOMY_DISTRIBUTION: { id: TaxonomyCategoryId; count: number }[] = [
  { id: "withdrawal-failures", count: 5 },
  { id: "transfer-logic", count: 4 },
  { id: "state-transitions", count: 3 },
  { id: "missing-recovery", count: 2 },
  { id: "library-dependencies", count: 2 },
];

export function getDemoDashboardStats() {
  const totalFindings = DEMO_ANALYSES.reduce((sum, a) => sum + a.findingCount, 0);
  const highRisk = DEMO_ANALYSES.reduce((sum, a) => sum + a.severityCounts.critical + a.severityCounts.high, 0);
  const protocols = new Set(DEMO_ANALYSES.map((a) => a.projectName)).size;
  return {
    analyses: DEMO_ANALYSES.length,
    findings: totalFindings,
    protocols,
    highRisk,
  };
}
