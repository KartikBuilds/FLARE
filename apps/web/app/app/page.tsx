import type { Metadata } from "next";
import { Badge } from "@flare/ui";
import { ENGINE_STATUS } from "@/lib/engine-status";
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
  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Dashboard</h1>
          <p className="mt-1 font-sans text-sm text-muted">Your security analyses and findings at a glance.</p>
        </div>
        <Badge tone={ENGINE_STATUS.implemented ? "success" : "warning"}>
          {ENGINE_STATUS.implemented ? "Live Engine" : "Demo / Fixture Data — Engine Not Implemented"}
        </Badge>
      </div>

      <div className="mt-8">
        <StatCards />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <RecentAnalysesTable />
        <RiskDistributionChart />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <TaxonomyDistributionWidget />
        <ReadyToAnalyseCard />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        <ResearchStatusCard />
        <EngineHealthCard />
        <BenchmarkResultCard />
      </div>

      <DashboardAstronaut />
    </div>
  );
}
