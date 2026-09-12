import type { Metadata } from "next";
import { hasLiveApiConfigured } from "@/lib/engine-status";
import { TerminalStat, TerminalStatusBadge } from "@/components/terminal";
import { StatCards } from "@/components/dashboard/StatCards";
import { RecentAnalysesTable } from "@/components/dashboard/RecentAnalysesTable";
import { RiskDistributionChart } from "@/components/dashboard/RiskDistributionChart";
import { TaxonomyDistributionWidget } from "@/components/dashboard/TaxonomyDistributionWidget";
import { ReadyToAnalyseCard } from "@/components/dashboard/ReadyToAnalyseCard";
import { ResearchStatusCard, EngineHealthCard, BenchmarkResultCard } from "@/components/dashboard/StatusCards";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPageTerminal() {
  const live = hasLiveApiConfigured();

  return (
    <div className="terminal-shell bg-terminal-bg min-h-screen px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-6 max-w-7xl">
        {/* Terminal Status Line */}
        <div className="terminal-panel p-3 font-mono text-xs flex items-center justify-between">
          <div className="flex gap-4">
            <span className="terminal-muted">FLARE CONTROL TERMINAL</span>
            <span className={live ? "terminal-green" : "terminal-amber"}>
              ENGINE [{live ? "ONLINE" : "DEMO"}]
            </span>
            <span className="terminal-muted">ANALYZER [SLITHER]</span>
            <span className="terminal-muted">NETWORK [EVM]</span>
          </div>
          <span className="terminal-muted">v2.0</span>
        </div>

        {/* Main Heading */}
        <div>
          <h1 className="font-mono text-3xl font-bold terminal-white tracking-tight sm:text-4xl">
            $ FLARE_DASHBOARD
          </h1>
          <p className="mt-2 font-mono text-sm terminal-text">
            Your security analyses and findings at a glance.
          </p>
        </div>

        {/* Status Badge */}
        <div>
          <TerminalStatusBadge
            status={live ? "success" : "warning"}
            label={
              live
                ? "LIVE_ENGINE"
                : "DEMO / FIXTURE_DATA — ANALYZER_NOT_CONFIGURED"
            }
          />
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="mt-12 max-w-7xl space-y-8">
        {/* Stat Cards */}
        <div className="mt-8">
          <StatCards />
        </div>

        {/* Main Panels */}
        <div className="grid min-w-0 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="min-w-0">
            <RecentAnalysesTable />
          </div>
          <div className="min-w-0">
            <RiskDistributionChart />
          </div>
        </div>

        {/* Secondary Panels */}
        <div className="grid min-w-0 gap-6 lg:grid-cols-2">
          <div className="min-w-0">
            <TaxonomyDistributionWidget />
          </div>
          <div className="min-w-0">
            <ReadyToAnalyseCard />
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid min-w-0 gap-6 lg:grid-cols-3">
          <ResearchStatusCard />
          <EngineHealthCard />
          <BenchmarkResultCard />
        </div>
      </div>
    </div>
  );
}
