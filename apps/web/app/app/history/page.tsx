"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, DemoBadge, LiveEngineBadge, Card } from "@flare/ui";
import type { RiskBand } from "@flare/schemas";
import { useAnalyses } from "@/lib/queries";
import { formatRelativeTime } from "@/lib/format";
import { AppPageHeader } from "@/components/app/AppPageHeader";

const RISK_TONE: Record<RiskBand, "danger" | "warning" | "success"> = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  low: "success",
  minimal: "success",
};

const FILTERS: { label: string; value: RiskBand | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

export default function HistoryPage() {
  const { data: analyses, isLoading } = useAnalyses();
  const [filter, setFilter] = useState<RiskBand | "all">("all");

  const filtered = analyses?.filter((a) => filter === "all" || a.riskBand === filter) ?? [];

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <AppPageHeader
        title="History"
        lead="Every analysis FLARE has run, filterable by risk band."
        note="newest first"
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`sketch-control border-[1.5px] px-3.5 py-1.5 font-condensed text-[12px] uppercase tracking-[0.06em] transition-colors ${
              filter === f.value
                ? "border-ink bg-ink text-paper"
                : "border-line-strong/60 text-ink-soft hover:border-ink"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card className="mt-6 p-0">
        {isLoading && <div className="px-5 py-10 text-center font-sans text-sm text-muted">Loading…</div>}
        {!isLoading && filtered.length === 0 && (
          <div className="px-5 py-10 text-center font-sans text-sm text-muted">No analyses match this filter.</div>
        )}
        <ul>
          {filtered.map((analysis) => (
            <li key={analysis.id} className="border-b border-line last:border-b-0">
              <Link
                href={`/app/analysis/${analysis.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-paper-flat"
              >
                <div className="min-w-0">
                  <p className="font-sans text-sm font-medium text-ink">
                    {analysis.projectName} <span className="font-normal text-muted">{analysis.projectVersion}</span>
                  </p>
                  <p className="mt-0.5 font-condensed text-[11.5px] uppercase tracking-[0.04em] text-muted">
                    {analysis.findingCount} findings · {formatRelativeTime(analysis.createdAt)} · Coverage{" "}
                    {analysis.coverage !== null ? Math.round(analysis.coverage * 100) : "—"}%
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {analysis.flareScore !== null && (
                    <span className="font-condensed text-sm font-semibold tabular-nums">{analysis.flareScore}</span>
                  )}
                  {analysis.riskBand && <Badge tone={RISK_TONE[analysis.riskBand]}>{analysis.riskBand}</Badge>}
                  {analysis.origin === "demo" ? <DemoBadge /> : <LiveEngineBadge />}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
