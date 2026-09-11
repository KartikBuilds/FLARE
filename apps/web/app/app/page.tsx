import type { Metadata } from "next";
import { Badge } from "@flare/ui";
import { hasLiveApiConfigured } from "@/lib/engine-status";
import { StatCards } from "@/components/dashboard/StatCards";
import { RecentAnalysesTable } from "@/components/dashboard/RecentAnalysesTable";
import { RiskDistributionChart } from "@/components/dashboard/RiskDistributionChart";
import { TaxonomyDistributionWidget } from "@/components/dashboard/TaxonomyDistributionWidget";
import { ReadyToAnalyseCard } from "@/components/dashboard/ReadyToAnalyseCard";
import { ResearchStatusCard, EngineHealthCard, BenchmarkResultCard } from "@/components/dashboard/StatusCards";
import { DashboardAstronaut } from "@/components/dashboard/DashboardAstronaut";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  const live = hasLiveApiConfigured();
  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Dashboard</h1>
          <p className="mt-1 font-sans text-sm text-muted">Your security analyses and findings at a glance.</p>
        </div>
        <Badge tone={live ? "success" : "warning"}>
          {live ? "Live Engine" : "Demo / Fixture Data — Analyzer Not Configured"}
        </Badge>
      </div>

      <div className="mt-8">
        <StatCards />
      </div>

      {/* min-w-0 on every grid track: CSS Grid items default to
          min-width:auto, so below each breakpoint's multi-column layout the
          single implicit track still sizes to its content's max-content
          width instead of the viewport — the same overflow trap fixed
          elsewhere in Phase 3, caught here at 320px specifically. */}
      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="min-w-0">
          <RecentAnalysesTable />
        </div>
        <div className="min-w-0">
          <RiskDistributionChart />
        </div>
      </div>

      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <TaxonomyDistributionWidget />
        </div>
        <div className="min-w-0">
          <ReadyToAnalyseCard />
        </div>
      </div>

      <div className="mt-6 grid min-w-0 gap-6 sm:grid-cols-3">
        <div className="min-w-0">
          <ResearchStatusCard />
        </div>
        <div className="min-w-0">
          <EngineHealthCard />
        </div>
        <div className="min-w-0">
          <BenchmarkResultCard />
        </div>
      </div>

      <DashboardAstronaut />
    </div>
  );
}
