import type { Metadata } from "next";
import { Badge } from "@flare/ui";
import { hasLiveApiConfigured } from "@/lib/engine-status";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { Reveal } from "@/components/motion";
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
      <AppPageHeader
        title="Dashboard"
        lead="Your security analyses and findings at a glance."
        note={live ? "engine is live" : "showing fixtures"}
        action={
          <Badge tone={live ? "success" : "warning"}>
            {live ? "Live Engine" : "Demo / Fixture Data — Analyzer Not Configured"}
          </Badge>
        }
      />

      <Reveal className="mt-8">
        <StatCards />
      </Reveal>

      {/* min-w-0 on every grid track: CSS Grid items default to
          min-width:auto, so below each breakpoint's multi-column layout the
          single implicit track still sizes to its content's max-content
          width instead of the viewport — the same overflow trap fixed
          elsewhere in Phase 3, caught here at 320px specifically. */}
      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Reveal className="min-w-0">
          <RecentAnalysesTable />
        </Reveal>
        <Reveal delay={0.08} className="min-w-0">
          <RiskDistributionChart />
        </Reveal>
      </div>

      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-2">
        <Reveal className="min-w-0">
          <TaxonomyDistributionWidget />
        </Reveal>
        <Reveal delay={0.08} className="min-w-0">
          <ReadyToAnalyseCard />
        </Reveal>
      </div>

      <div className="mt-6 grid min-w-0 gap-6 sm:grid-cols-3">
        <Reveal className="min-w-0">
          <ResearchStatusCard />
        </Reveal>
        <Reveal delay={0.07} className="min-w-0">
          <EngineHealthCard />
        </Reveal>
        <Reveal delay={0.14} className="min-w-0">
          <BenchmarkResultCard />
        </Reveal>
      </div>

      <DashboardAstronaut />
    </div>
  );
}
