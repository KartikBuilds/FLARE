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
  note: "The FastAPI analyzer service is not yet implemented in this milestone. Everything shown outside explicit DEMO data is architecture, not a live result.",
};
