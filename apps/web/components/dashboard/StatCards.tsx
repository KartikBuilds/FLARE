"use client";

import { Card, AnimatedCounter } from "@flare/ui";
import { useAnalyses } from "@/lib/queries";
import { getDemoDashboardStats } from "@/lib/demo-data";

function computeStats(analyses: ReturnType<typeof useAnalyses>["data"]) {
  if (!analyses) return getDemoDashboardStats();
  const findings = analyses.reduce((sum, a) => sum + a.findingCount, 0);
  const highRisk = analyses.reduce((sum, a) => sum + a.severityCounts.critical + a.severityCounts.high, 0);
  const protocols = new Set(analyses.map((a) => a.projectName)).size;
  return { analyses: analyses.length, findings, protocols, highRisk };
}

export function StatCards() {
  const { data: analyses } = useAnalyses();
  const stats = computeStats(analyses);

  const cards = [
    { label: "Analyses", sublabel: "Total", value: stats.analyses },
    { label: "Findings", sublabel: "Demo Data", value: stats.findings },
    { label: "Protocols", sublabel: "Analyzed", value: stats.protocols },
    { label: "High Risk", sublabel: "Findings", value: stats.highRisk },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <p className="font-display text-4xl font-bold tabular-nums tracking-tight">
            <AnimatedCounter value={card.value} formatter={(n) => n.toString().padStart(2, "0")} />
          </p>
          <p className="mt-2 font-sans text-sm font-medium text-ink">{card.label}</p>
          <p className="font-condensed text-[11px] uppercase tracking-[0.06em] text-muted">{card.sublabel}</p>
        </Card>
      ))}
    </div>
  );
}
