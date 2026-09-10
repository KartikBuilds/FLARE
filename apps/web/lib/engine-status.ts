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
  implemented: false,
  note: "The FastAPI analyzer service now runs real intake, compilation and Slither-based extraction (services/analyzer) — but the detector registry, fund-flow graph and risk scoring aren't wired in yet, so a live analysis would report zero findings. The dashboard stays on demo data until that's genuinely worth showing as live.",
};
