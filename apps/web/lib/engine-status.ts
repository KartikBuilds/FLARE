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
  note: "The FastAPI analyzer service (services/analyzer) now runs the full deterministic pipeline end to end — intake, compilation, Slither extraction, all 10 detectors, the fund-flow graph, and the FLARE risk score — and every stage has passing tests. What's still missing is the frontend wiring: /app/analysis/new doesn't call the live API yet. The dashboard stays on demo data until that last connection is made and tested.",
};
