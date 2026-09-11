import Link from "next/link";
import { Card, Badge } from "@flare/ui";
import { RESEARCH_PILLARS } from "@/lib/research-pillars";
import { ENGINE_STATUS, hasLiveApiConfigured } from "@/lib/engine-status";
import { getBenchmarkResult } from "@/lib/benchmark";

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
  const configured = hasLiveApiConfigured();
  return (
    <Card>
      <h2 className="font-sans text-base font-semibold text-ink">Engine Health</h2>
      <div className="mt-4 flex items-center gap-2.5">
        <span aria-hidden="true" className={`size-2.5 rounded-full ${configured ? "bg-success" : "bg-warning"}`} />
        <span className="font-sans text-sm text-ink">
          {configured ? "Configured (NEXT_PUBLIC_ANALYZER_API_URL set)" : "Not configured"}
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
  const result = getBenchmarkResult();

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-base font-semibold text-ink">Recent Benchmark Result</h2>
        {result && <Badge tone="success">Generated</Badge>}
      </div>

      {result ? (
        <>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="font-display text-3xl font-bold tabular-nums">
                {result.precision !== null ? `${Math.round(result.precision * 100)}%` : "—"}
              </p>
              <p className="font-condensed text-[11px] uppercase tracking-[0.06em] text-muted">Precision</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold tabular-nums">
                {result.recall !== null ? `${Math.round(result.recall * 100)}%` : "—"}
              </p>
              <p className="font-condensed text-[11px] uppercase tracking-[0.06em] text-muted">Recall</p>
            </div>
          </div>
          <p className="mt-3 font-sans text-xs text-muted">
            {result.total_cases} fixture cases · {result.true_positives + result.true_negatives} correct
            {result.false_positives + result.false_negatives > 0 &&
              ` · ${result.false_positives + result.false_negatives} misclassified`}
          </p>
        </>
      ) : (
        <p className="mt-4 font-sans text-sm text-muted">
          No benchmark report has been generated in this checkout yet.
        </p>
      )}

      <Link
        href="/docs/benchmark"
        className="mt-4 inline-block font-condensed text-[11.5px] uppercase tracking-[0.06em] text-ink underline decoration-line underline-offset-4"
      >
        Read the benchmark plan →
      </Link>
    </Card>
  );
}
