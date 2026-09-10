import Link from "next/link";
import { Card, Badge } from "@flare/ui";
import { RESEARCH_PILLARS } from "@/lib/research-pillars";
import { ENGINE_STATUS } from "@/lib/engine-status";

export function ResearchStatusCard() {
  return (
    <Card>
      <h2 className="font-sans text-base font-semibold text-ink">Research Status</h2>
      <ul className="mt-4 space-y-3">
        {RESEARCH_PILLARS.map((pillar) => (
          <li key={pillar.name} className="flex items-center justify-between gap-3">
            <span className="font-sans text-[13px] text-ink-soft">{pillar.name}</span>
            <Badge tone={pillar.tone}>{pillar.status}</Badge>
          </li>
        ))}
      </ul>
      <Link
        href="/docs/methodology"
        className="mt-4 inline-block font-condensed text-[11.5px] uppercase tracking-[0.06em] text-ink underline decoration-line underline-offset-4"
      >
        Read methodology →
      </Link>
    </Card>
  );
}

export function EngineHealthCard() {
  return (
    <Card>
      <h2 className="font-sans text-base font-semibold text-ink">Engine Health</h2>
      <div className="mt-4 flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className={`size-2.5 rounded-full ${ENGINE_STATUS.implemented ? "bg-success" : "bg-warning"}`}
        />
        <span className="font-sans text-sm text-ink">
          {ENGINE_STATUS.implemented ? "Connected" : "Not connected"}
        </span>
      </div>
      <p className="mt-2 font-sans text-[13px] leading-relaxed text-muted">{ENGINE_STATUS.note}</p>
      <Link
        href="/docs/architecture"
        className="mt-4 inline-block font-condensed text-[11.5px] uppercase tracking-[0.06em] text-ink underline decoration-line underline-offset-4"
      >
        View architecture →
      </Link>
    </Card>
  );
}

export function BenchmarkResultCard() {
  return (
    <Card>
      <h2 className="font-sans text-base font-semibold text-ink">Recent Benchmark Result</h2>
      <p className="mt-4 font-sans text-sm text-muted">
        The benchmark suite has not been run yet — it ships with the detector registry
        implementation.
      </p>
      <Link
        href="/docs/benchmark"
        className="mt-4 inline-block font-condensed text-[11.5px] uppercase tracking-[0.06em] text-ink underline decoration-line underline-offset-4"
      >
        Read the benchmark plan →
      </Link>
    </Card>
  );
}
