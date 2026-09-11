/**
 * Single source of truth for whether the real analyzer engine is wired up
 * end-to-end yet. Flipped once services/analyzer is implemented and the web
 * app can actually reach it — every DEMO/LIVE badge in the app reads this
 * instead of guessing per-component. See docs/LIMITATIONS.md for the
 * up-to-date narrative version of this status.
 */
export const ENGINE_STATUS: {
  implemented: boolean;
  note: string;
} = {
  implemented: true,
  note: "The FastAPI analyzer service (services/analyzer) runs the full deterministic pipeline end to end — intake, compilation, Slither extraction, all 10 detectors, the fund-flow graph, and the FLARE risk score — and /app/analysis/new submits directly to it. Requires NEXT_PUBLIC_ANALYZER_API_URL to point at a running instance (docker compose up analyzer); the dashboard and history show real analyses, which will be empty until you run one.",
};

/**
 * Whether a live analyzer URL is actually configured for this build/runtime
 * — distinct from ENGINE_STATUS.implemented, which describes whether the
 * *code* is wired up. A dashboard "Live Engine" claim should key off this,
 * not the code-completeness flag, so it never says "connected" when
 * NEXT_PUBLIC_ANALYZER_API_URL simply isn't set. Safe to call from a Server
 * Component — NEXT_PUBLIC_ vars are inlined at build time either way.
 */
export function hasLiveApiConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_ANALYZER_API_URL);
}
