import type { AnalysisSummary } from "@flare/schemas";
import { ENGINE_STATUS } from "./engine-status";
import { DEMO_ANALYSES } from "./demo-data";

const API_BASE = process.env.NEXT_PUBLIC_ANALYZER_API_URL;

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
