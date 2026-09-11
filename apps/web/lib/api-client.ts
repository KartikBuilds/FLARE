import type { AnalysisSummary } from "@flare/schemas";
import { ENGINE_STATUS } from "./engine-status";
import { DEMO_ANALYSES } from "./demo-data";

const API_BASE = process.env.NEXT_PUBLIC_ANALYZER_API_URL;

/** Non-throwing accessor for callers that just need to know whether/where a
 * live backend is configured (e.g. to build a direct link), as opposed to
 * requireApiBase() which throws for functions that must have one. */
export function getAnalyzerApiBase(): string | undefined {
  return API_BASE;
}

/**
 * Every function here returns the same shape the real FastAPI service will
 * return once ENGINE_STATUS.implemented flips to true and API_BASE is
 * configured — callers never need to change when that happens, only this
 * file does. Until then, it resolves with clearly-`origin: "demo"` fixture
 * data so the UI can render a real DEMO badge instead of an empty state.
 */
export async function fetchAnalyses(): Promise<AnalysisSummary[]> {
  if (ENGINE_STATUS.implemented && API_BASE) {
    const res = await fetch(`${API_BASE}/analyses`);
    if (!res.ok) throw new Error(`Failed to fetch analyses: ${res.status}`);
    return res.json();
  }
  await new Promise((resolve) => setTimeout(resolve, 150));
  return DEMO_ANALYSES;
}

export async function fetchAnalysis(id: string): Promise<AnalysisSummary | undefined> {
  if (ENGINE_STATUS.implemented && API_BASE) {
    const res = await fetch(`${API_BASE}/analyses/${id}`);
    if (res.status === 404) return undefined;
    if (!res.ok) throw new Error(`Failed to fetch analysis ${id}: ${res.status}`);
    return res.json();
  }
  await new Promise((resolve) => setTimeout(resolve, 150));
  return DEMO_ANALYSES.find((a) => a.id === id);
}

/**
 * Submitting a new analysis always talks to the real analyzer directly —
 * there is no simulated/demo submission path. A failure here must never be
 * papered over with demo data; callers surface the real error message.
 */
function requireApiBase(): string {
  if (!API_BASE) {
    throw new Error(
      "The analyzer service isn't configured (NEXT_PUBLIC_ANALYZER_API_URL is unset) — set it to a running services/analyzer instance.",
    );
  }
  return API_BASE;
}

async function postAnalysis(path: string, init: RequestInit): Promise<AnalysisSummary> {
  const base = requireApiBase();
  const res = await fetch(`${base}${path}`, init);
  if (!res.ok) {
    let detail = `Request failed with status ${res.status}.`;
    try {
      const body: unknown = await res.json();
      if (body && typeof body === "object" && "detail" in body && typeof body.detail === "string") {
        detail = body.detail;
      }
    } catch {
      // Response wasn't JSON — fall back to the generic status message.
    }
    throw new Error(detail);
  }
  return res.json();
}

export async function submitFiles(files: File[]): Promise<AnalysisSummary> {
  const form = new FormData();
  for (const file of files) form.append("files", file);
  return postAnalysis("/analyses/upload-files", { method: "POST", body: form });
}

export async function submitZip(file: File): Promise<AnalysisSummary> {
  const form = new FormData();
  form.append("file", file);
  return postAnalysis("/analyses/upload-zip", { method: "POST", body: form });
}

export async function submitGithub(url: string): Promise<AnalysisSummary> {
  return postAnalysis("/analyses/github", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
}

export async function submitAddress(address: string): Promise<AnalysisSummary> {
  return postAnalysis("/analyses/verified-address", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });
}

export async function submitBenchmarkCase(caseId: string): Promise<AnalysisSummary> {
  return postAnalysis("/analyses/benchmark", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ case: caseId }),
  });
}

const TERMINAL_STATUSES = new Set(["complete", "failed"]);

/** Polls GET /analyses/{id} until the backend reports a terminal status,
 * invoking onProgress with every intermediate AnalysisStatus along the way
 * so the caller can render real pipeline-stage progress. */
export async function pollAnalysisUntilDone(
  id: string,
  onProgress?: (summary: AnalysisSummary) => void,
  { intervalMs = 1000, timeoutMs = 120_000 }: { intervalMs?: number; timeoutMs?: number } = {},
): Promise<AnalysisSummary> {
  const base = requireApiBase();
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const res = await fetch(`${base}/analyses/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch analysis ${id}: ${res.status}`);
    const summary: AnalysisSummary = await res.json();
    onProgress?.(summary);
    if (TERMINAL_STATUSES.has(summary.status)) return summary;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error("Timed out waiting for the analysis to finish.");
}
