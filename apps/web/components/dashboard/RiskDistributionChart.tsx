"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, DemoBadge } from "@flare/ui";
import { useAnalyses } from "@/lib/queries";
import { getDemoRiskDistribution } from "@/lib/demo-data";

const COLORS: Record<string, string> = {
  Critical: "#131210",
  High: "#37352d",
  Medium: "#9a9584",
  Low: "#c7c2af",
};

export function RiskDistributionChart() {
  const { data: analyses } = useAnalyses();

  const dist = analyses
    ? analyses.reduce(
        (acc, a) => {
          acc.critical += a.severityCounts.critical ?? 0;
          acc.high += a.severityCounts.high ?? 0;
          acc.medium += a.severityCounts.medium ?? 0;
          acc.low += a.severityCounts.low ?? 0;
          return acc;
        },
        { critical: 0, high: 0, medium: 0, low: 0 },
      )
    : getDemoRiskDistribution();

  const data = [
    { name: "Critical", value: dist.critical },
    { name: "High", value: dist.high },
    { name: "Medium", value: dist.medium },
    { name: "Low", value: dist.low },
  ];
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-base font-semibold text-ink">Risk Distribution</h2>
        <DemoBadge />
      </div>
      {total === 0 ? (
        <p className="mt-6 font-sans text-sm text-muted">No findings to distribute yet.</p>
      ) : (
        <div className="mt-2 flex items-center gap-6">
          {/* Decorative: the adjacent legend list already gives an accessible
              equivalent (name + value) for every slice. `inert` (not just
              aria-hidden) is required — Recharts puts a tabindex="0" group
              inside the SVG for keyboard nav, which aria-hidden alone would
              leave focusable while invisible to assistive tech. */}
          <div className="h-40 w-40 shrink-0" inert>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius={44} outerRadius={68} paddingAngle={2} stroke="none">
                  {data.map((d) => (
                    <Cell key={d.name} fill={COLORS[d.name]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} findings`, name]}
                  contentStyle={{
                    background: "var(--color-paper-flat)",
                    border: "1px solid var(--color-line)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2">
            {data.map((d) => (
              <li key={d.name} className="flex items-center gap-2 font-sans text-sm">
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[d.name] }}
                />
                <span className="text-ink-soft">{d.name}</span>
                <span className="font-medium text-ink">{d.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
