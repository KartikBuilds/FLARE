"use client";

import Link from "next/link";
import { Card, Badge, DemoBadge, LiveEngineBadge, AnimatedCounter } from "@flare/ui";
import type { RiskBand } from "@flare/schemas";
import { useAnalysis } from "@/lib/queries";
import { formatRelativeTime } from "@/lib/format";

const RISK_TONE: Record<RiskBand, "danger" | "warning" | "success"> = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  low: "success",
  minimal: "success",
};

export function AnalysisDetailClient({ id }: { id: string }) {
  const { data: analysis, isLoading, isError } = useAnalysis(id);

  if (isLoading) {
    return <p className="px-5 py-10 font-sans text-sm text-muted sm:px-8 lg:px-10">Loading…</p>;
  }

  if (isError || !analysis) {
    return (
      <div className="px-5 py-10 sm:px-8 lg:px-10">
        <h1 className="font-display text-2xl font-bold">Analysis not found</h1>
        <p className="mt-2 font-sans text-sm text-muted">
          There&apos;s no analysis with id <code className="font-mono">{id}</code>.
        </p>
        <Link href="/app/history" className="mt-4 inline-block font-condensed text-[12px] uppercase tracking-[0.06em] underline">
          Back to history →
        </Link>
      </div>
    );
  }

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-condensed text-[12px] uppercase tracking-[0.08em] text-muted">
            {formatRelativeTime(analysis.createdAt)}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {analysis.projectName} <span className="text-muted">{analysis.projectVersion}</span>
          </h1>
        </div>
        {analysis.origin === "demo" ? <DemoBadge /> : <LiveEngineBadge />}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="font-display text-4xl font-bold tabular-nums tracking-tight">
            {analysis.flareScore !== null ? <AnimatedCounter value={analysis.flareScore} /> : "—"}
          </p>
          <p className="mt-2 font-sans text-sm text-ink">FLARE Score</p>
        </Card>
        <Card>
          {analysis.riskBand ? (
            <Badge tone={RISK_TONE[analysis.riskBand]} className="text-sm">
              {analysis.riskBand}
            </Badge>
          ) : (
            <span className="font-sans text-sm text-muted">—</span>
          )}
          <p className="mt-3 font-sans text-sm text-ink">Risk Band</p>
        </Card>
        <Card>
          <p className="font-display text-4xl font-bold tabular-nums tracking-tight">
            {analysis.coverage !== null ? <AnimatedCounter value={Math.round(analysis.coverage * 100)} formatter={(n) => `${n}%`} /> : "—"}
          </p>
          <p className="mt-2 font-sans text-sm text-ink">Coverage / Confidence</p>
        </Card>
        <Card>
          <p className="font-display text-4xl font-bold tabular-nums tracking-tight">
            <AnimatedCounter value={analysis.findingCount} />
          </p>
          <p className="mt-2 font-sans text-sm text-ink">Findings</p>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="font-sans text-base font-semibold text-ink">Findings by severity</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(["critical", "high", "medium", "low"] as const).map((sev) => (
            <div key={sev}>
              <p className="font-display text-2xl font-bold tabular-nums">{analysis.severityCounts[sev] ?? 0}</p>
              <p className="font-condensed text-[11px] uppercase tracking-[0.06em] text-muted">{sev}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-6 border-dashed">
        <p className="font-sans text-sm text-ink-soft">
          The full findings list, source-level evidence, asset-flow graph, state model,
          dependency view, validation status and tool comparison land here once{" "}
          <Link href="/docs/architecture" className="underline decoration-line underline-offset-2 hover:decoration-ink">
            the graph and validation milestone
          </Link>{" "}
          is implemented. This overview reflects everything the analyzer currently reports.
        </p>
      </Card>
    </div>
  );
}
