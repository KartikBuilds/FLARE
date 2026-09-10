"use client";

import Link from "next/link";
import { Card, Badge, DemoBadge, LiveEngineBadge } from "@flare/ui";
import type { RiskBand } from "@flare/schemas";
import { useAnalyses } from "@/lib/queries";
import { formatRelativeTime } from "@/lib/format";

const RISK_TONE: Record<RiskBand, "danger" | "warning" | "success"> = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  low: "success",
  minimal: "success",
};

export function RecentAnalysesTable() {
  const { data: analyses, isLoading } = useAnalyses();

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="font-sans text-base font-semibold text-ink">Recent Analyses</h2>
        <Link
          href="/app/history"
          className="font-condensed text-[12px] uppercase tracking-[0.06em] text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
        >
          View all →
        </Link>
      </div>

      {isLoading && <div className="px-5 py-8 text-center font-sans text-sm text-muted">Loading…</div>}

      {analyses && analyses.length === 0 && (
        <div className="px-5 py-10 text-center">
          <p className="font-sans text-sm text-muted">No analyses yet.</p>
          <Link
            href="/app/analysis/new"
            className="mt-2 inline-block font-condensed text-[12px] uppercase tracking-[0.06em] text-ink underline decoration-line underline-offset-4"
          >
            Start your first analysis →
          </Link>
        </div>
      )}

      <ul>
        {analyses?.slice(0, 5).map((analysis) => (
          <li key={analysis.id} className="border-b border-line last:border-b-0">
            <Link
              href={`/app/analysis/${analysis.id}`}
              className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-paper-flat"
            >
              <div className="min-w-0">
                <p className="truncate font-sans text-sm font-medium text-ink">
                  {analysis.projectName} <span className="font-normal text-muted">{analysis.projectVersion}</span>
                </p>
                <p className="mt-0.5 font-condensed text-[11.5px] uppercase tracking-[0.04em] text-muted">
                  {analysis.findingCount} findings · {formatRelativeTime(analysis.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {analysis.riskBand && <Badge tone={RISK_TONE[analysis.riskBand]}>{analysis.riskBand}</Badge>}
                {analysis.origin === "demo" ? <DemoBadge /> : <LiveEngineBadge />}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
