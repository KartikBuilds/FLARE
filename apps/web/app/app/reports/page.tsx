"use client";

import Link from "next/link";
import { FileJson, FileText } from "lucide-react";
import { Card, DemoBadge, LiveEngineBadge } from "@flare/ui";
import { useAnalyses } from "@/lib/queries";
import { formatRelativeTime } from "@/lib/format";
import { ENGINE_STATUS } from "@/lib/engine-status";

export default function ReportsPage() {
  const { data: analyses, isLoading } = useAnalyses();

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Reports</h1>
      <p className="mt-1 max-w-xl font-sans text-sm text-muted">
        Every completed analysis produces a versioned JSON report and a self-contained HTML
        report.{" "}
        {!ENGINE_STATUS.implemented &&
          "Report generation ships with the analyzer — until then, these link to each analysis's demo overview."}
      </p>

      {isLoading && <p className="mt-8 font-sans text-sm text-muted">Loading…</p>}

      <Card className="mt-6 p-0">
        <ul>
          {analyses?.map((analysis) => (
            <li key={analysis.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 last:border-b-0">
              <div className="min-w-0">
                <p className="font-sans text-sm font-medium text-ink">
                  {analysis.projectName} <span className="font-normal text-muted">{analysis.projectVersion}</span>
                </p>
                <p className="mt-0.5 font-condensed text-[11.5px] uppercase tracking-[0.04em] text-muted">
                  {formatRelativeTime(analysis.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {analysis.origin === "demo" ? <DemoBadge /> : <LiveEngineBadge />}
                <Link
                  href={`/app/analysis/${analysis.id}`}
                  className="flex items-center gap-1.5 font-condensed text-[12px] uppercase tracking-[0.06em] text-ink-soft hover:text-ink"
                >
                  <FileText className="size-3.5" aria-hidden="true" />
                  HTML
                </Link>
                <Link
                  href={`/app/analysis/${analysis.id}`}
                  className="flex items-center gap-1.5 font-condensed text-[12px] uppercase tracking-[0.06em] text-ink-soft hover:text-ink"
                >
                  <FileJson className="size-3.5" aria-hidden="true" />
                  JSON
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
