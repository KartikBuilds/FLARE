import { describe, expect, it } from "vitest";
import { DEMO_ANALYSES, getDemoDashboardStats, getDemoRiskDistribution } from "@/lib/demo-data";
import { AnalysisSummary } from "@flare/schemas";

describe("demo analyses", () => {
  it("validates against the AnalysisSummary schema", () => {
    for (const analysis of DEMO_ANALYSES) {
      expect(() => AnalysisSummary.parse(analysis)).not.toThrow();
    }
  });

  it("are all tagged origin: demo (never silently presented as live)", () => {
    for (const analysis of DEMO_ANALYSES) {
      expect(analysis.origin).toBe("demo");
    }
  });
});

describe("getDemoDashboardStats", () => {
  it("sums findings and high-risk counts consistently with the raw fixtures", () => {
    const stats = getDemoDashboardStats();
    const expectedFindings = DEMO_ANALYSES.reduce((s, a) => s + a.findingCount, 0);
    const expectedHighRisk = DEMO_ANALYSES.reduce(
      (s, a) => s + a.severityCounts.critical + a.severityCounts.high,
      0,
    );
    expect(stats.findings).toBe(expectedFindings);
    expect(stats.highRisk).toBe(expectedHighRisk);
    expect(stats.analyses).toBe(DEMO_ANALYSES.length);
  });
});

describe("getDemoRiskDistribution", () => {
  it("sums to the same total as findingCount across all analyses", () => {
    const dist = getDemoRiskDistribution();
    const total = dist.critical + dist.high + dist.medium + dist.low;
    const expectedTotal = DEMO_ANALYSES.reduce((s, a) => s + a.findingCount, 0);
    expect(total).toBe(expectedTotal);
  });
});
