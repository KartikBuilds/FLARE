"use client";

import Link from "next/link";
import { Card, Badge, DemoBadge, LiveEngineBadge } from "@flare/ui";
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

export default function ProjectsPage() {
  const { data: analyses, isLoading } = useAnalyses();

  const projects = new Map<string, typeof analyses>();
  for (const a of analyses ?? []) {
    const list = projects.get(a.projectName) ?? [];
    list.push(a);
    projects.set(a.projectName, list);
  }

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <AppPageHeader
        title="Projects"
        lead="Every protocol FLARE has analyzed, grouped by project."
        note="one card per protocol"
      />

      {isLoading && <p className="mt-8 font-sans text-sm text-muted">Loading…</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from(projects.entries()).map(([name, list]) => {
          const latest = list!.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0]!;
          return (
            <Card key={name}>
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-sans text-base font-semibold text-ink">{name}</h2>
                {latest.origin === "demo" ? <DemoBadge /> : <LiveEngineBadge />}
              </div>
              <p className="mt-1 font-condensed text-[11px] uppercase tracking-[0.06em] text-muted">
                Latest {latest.projectVersion} · {formatRelativeTime(latest.createdAt)}
              </p>
              <div className="mt-4 flex items-center gap-2">
                {latest.riskBand && <Badge tone={RISK_TONE[latest.riskBand]}>{latest.riskBand}</Badge>}
                <span className="font-sans text-xs text-muted">
                  {list!.length} analysis{list!.length === 1 ? "" : "es"}
                </span>
              </div>
              <Link
                href={`/app/analysis/${latest.id}`}
                className="mt-4 inline-block font-condensed text-[11.5px] uppercase tracking-[0.06em] text-ink underline decoration-line underline-offset-4"
              >
                View latest analysis →
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
