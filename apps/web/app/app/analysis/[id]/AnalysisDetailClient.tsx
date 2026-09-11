"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Download, FileJson } from "lucide-react";
import { Card, Badge, DemoBadge, LiveEngineBadge, AnimatedCounter, Button, cn } from "@flare/ui";
import type { GraphNode } from "@flare/graph";
import type { Incident, RiskBand } from "@flare/schemas";
import { useAnalysis } from "@/lib/queries";
import { formatRelativeTime } from "@/lib/format";
import { FindingsList } from "@/components/analysis/FindingsList";
import { NodeDetailPanel } from "@/components/analysis/NodeDetailPanel";

// React Flow needs the DOM (ResizeObserver, etc.) — never rendered on the server.
const AssetFlowGraph = dynamic(
  () => import("@/components/analysis/AssetFlowGraph").then((m) => m.AssetFlowGraph),
  { ssr: false, loading: () => <div className="h-[480px] animate-pulse rounded-[var(--radius-card)] bg-line-soft" /> },
);

const RISK_TONE: Record<RiskBand, "danger" | "warning" | "success"> = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  low: "success",
  minimal: "success",
};

const TABS = ["overview", "findings", "asset-flow", "report"] as const;
type Tab = (typeof TABS)[number];
const TAB_LABELS: Record<Tab, string> = {
  overview: "Overview",
  findings: "Findings",
  "asset-flow": "Asset Flow",
  report: "Report",
};

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function AnalysisDetailClient({ id, incidents }: { id: string; incidents: Incident[] }) {
  const { data: analysis, isLoading, isError } = useAnalysis(id);
  const [tab, setTab] = useState<Tab>("overview");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

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

  if (analysis.status === "failed") {
    return (
      <div className="px-5 py-10 sm:px-8 lg:px-10">
        <h1 className="font-display text-2xl font-bold">Analysis failed</h1>
        <p className="mt-1 font-sans text-sm text-muted">
          {analysis.projectName} <span>{analysis.projectVersion}</span>
        </p>
        <Card className="mt-4 border-danger-soft bg-danger-soft/20">
          <p className="font-sans text-sm text-danger">
            {analysis.error ?? "The analyzer reported a failure with no further detail."}
          </p>
        </Card>
        <Link href="/app/history" className="mt-4 inline-block font-condensed text-[12px] uppercase tracking-[0.06em] underline">
          Back to history →
        </Link>
      </div>
    );
  }

  if (analysis.status !== "complete") {
    return (
      <div className="px-5 py-10 sm:px-8 lg:px-10">
        <h1 className="font-display text-2xl font-bold">Analysis in progress</h1>
        <p className="mt-2 font-sans text-sm text-muted">
          {analysis.projectName} is still running (status: {analysis.status}). This page doesn&apos;t
          poll — return to{" "}
          <Link href="/app/analysis/new" className="underline decoration-line underline-offset-2">
            New Analysis
          </Link>{" "}
          to watch it run, or check back here shortly.
        </p>
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
          {analysis.formulaVersion && (
            <p className="mt-1 font-mono text-[11px] text-muted">formula v{analysis.formulaVersion}</p>
          )}
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
            {analysis.coverage !== null ? (
              <AnimatedCounter value={Math.round(analysis.coverage * 100)} formatter={(n) => `${n}%`} />
            ) : (
              "—"
            )}
          </p>
          <p className="mt-2 font-sans text-sm text-ink">Coverage / Confidence</p>
          {analysis.coverageNotes.length > 0 && (
            <ul className="mt-2 space-y-1">
              {analysis.coverageNotes.map((note) => (
                <li key={note} className="font-sans text-[11px] leading-snug text-muted">
                  {note}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <p className="font-display text-4xl font-bold tabular-nums tracking-tight">
            <AnimatedCounter value={analysis.findingCount} />
          </p>
          <p className="mt-2 font-sans text-sm text-ink">Findings</p>
        </Card>
      </div>

      <div role="tablist" aria-label="Analysis workspace" className="mt-8 flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "relative px-4 py-2.5 font-condensed text-[13px] font-medium uppercase tracking-[0.05em] transition-colors",
              tab === t ? "text-ink" : "text-muted hover:text-ink",
            )}
          >
            {TAB_LABELS[t]}
            {tab === t && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-ink" />}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" && (
          <div className="space-y-6">
            <Card>
              <h2 className="font-sans text-base font-semibold text-ink">Findings by severity</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {(["critical", "high", "medium", "low"] as const).map((sev) => (
                  <div key={sev}>
                    <p className="font-display text-2xl font-bold tabular-nums">
                      {analysis.severityCounts[sev] ?? 0}
                    </p>
                    <p className="font-condensed text-[11px] uppercase tracking-[0.06em] text-muted">{sev}</p>
                  </div>
                ))}
              </div>
            </Card>

            {analysis.findings.length === 0 && (
              <Card className="border-dashed">
                <p className="font-sans text-sm text-ink-soft">
                  No findings from the current ten-detector registry. See{" "}
                  <Link href="/docs/detectors" className="underline decoration-line underline-offset-2 hover:decoration-ink">
                    Detector Registry
                  </Link>{" "}
                  for exactly what was checked.
                </p>
              </Card>
            )}

            {analysis.scoreBreakdown.length > 0 && (
              <Card className="overflow-x-auto">
                <h2 className="font-sans text-base font-semibold text-ink">Score breakdown</h2>
                <p className="mt-1 font-sans text-xs text-muted">
                  The FLARE score is the highest-contributing finding below, times the coverage
                  multiplier — see{" "}
                  <Link href="/docs/risk-methodology" className="underline decoration-line underline-offset-2 hover:decoration-ink">
                    Risk Methodology
                  </Link>
                  .
                </p>
                <table className="mt-4 w-full min-w-[560px] font-sans text-[12.5px]">
                  <thead>
                    <tr className="border-b border-line text-left text-muted">
                      <th className="pb-2 pr-3 font-condensed uppercase tracking-[0.05em]">Finding</th>
                      <th className="pb-2 pr-3 font-condensed uppercase tracking-[0.05em]">Severity</th>
                      <th className="pb-2 pr-3 font-condensed uppercase tracking-[0.05em]">Confidence</th>
                      <th className="pb-2 pr-3 font-condensed uppercase tracking-[0.05em]">Reach</th>
                      <th className="pb-2 pr-3 font-condensed uppercase tracking-[0.05em]">Exposure</th>
                      <th className="pb-2 pr-3 font-condensed uppercase tracking-[0.05em]">Dependency</th>
                      <th className="pb-2 pr-3 font-condensed uppercase tracking-[0.05em]">Recovery</th>
                      <th className="pb-2 font-condensed uppercase tracking-[0.05em]">Contribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.scoreBreakdown.map((row) => (
                      <tr key={row.findingId} className="border-b border-line last:border-b-0">
                        <td className="py-2 pr-3 font-mono text-[11px] text-ink-soft">{row.findingId}</td>
                        <td className="py-2 pr-3 tabular-nums">{row.severityWeight}</td>
                        <td className="py-2 pr-3 tabular-nums">
                          {row.confidence.toFixed(2)}
                          {row.validated && <span className="ml-1 text-success">✓</span>}
                        </td>
                        <td className="py-2 pr-3">{row.reachability}</td>
                        <td className="py-2 pr-3 tabular-nums">{row.assetExposure.toFixed(2)}</td>
                        <td className="py-2 pr-3 tabular-nums">{row.dependencyCriticality.toFixed(2)}</td>
                        <td className="py-2 pr-3 tabular-nums">−{row.recoveryOffset.toFixed(2)}</td>
                        <td className="py-2 font-semibold tabular-nums">{row.contribution.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </div>
        )}

        {tab === "findings" && <FindingsList findings={analysis.findings} incidents={incidents} />}

        {tab === "asset-flow" &&
          (analysis.graph ? (
            <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
              <AssetFlowGraph graph={analysis.graph} onSelectNode={setSelectedNode} />
              <NodeDetailPanel node={selectedNode} findings={analysis.findings} />
            </div>
          ) : (
            <Card className="border-dashed">
              <p className="font-sans text-sm text-ink-soft">
                No fund-flow graph is available for this analysis yet.
              </p>
            </Card>
          ))}

        {tab === "report" && (
          <Card>
            <h2 className="font-sans text-base font-semibold text-ink">Download report</h2>
            <p className="mt-2 max-w-lg font-sans text-sm text-muted">
              A versioned JSON report with the full IR, findings and graph. A self-contained HTML
              report and a dedicated Tool Comparison / State Model / Dependencies view are planned
              — see{" "}
              <Link href="/docs/architecture" className="underline decoration-line underline-offset-2 hover:decoration-ink">
                Architecture
              </Link>
              .
            </p>
            <Button
              type="button"
              className="mt-4"
              arrow="none"
              onClick={() => downloadJson(`flare-report-${analysis.id}.json`, analysis)}
            >
              <FileJson className="mr-2 inline size-4" aria-hidden="true" />
              Download JSON
              <Download className="ml-2 inline size-4" aria-hidden="true" />
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
