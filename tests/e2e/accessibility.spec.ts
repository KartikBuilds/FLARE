import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Automated WCAG 2 AA accessibility pass (axe-core) across the pages named
 * in the build spec. This complements, but does not replace, the manual
 * keyboard/screen-reader checks noted in the final completion report — axe
 * catches programmatically-detectable issues only (contrast, name/role/value,
 * landmark structure), not full manual conformance.
 *
 * Emulates prefers-reduced-motion: the app honors it (usePrefersReducedMotion)
 * to skip entrance animations, so scans run against a settled DOM instead of
 * a mid-transition frame (an animating Motion opacity/transform otherwise
 * produces spurious, non-reproducible contrast readings).
 */
test.use({ reducedMotion: "reduce" });

const PAGES = [
  "/",
  "/docs",
  "/docs/architecture",
  "/app",
  "/app/analysis/demo-vaultline",
  "/app/history",
  "/app/analysis/new",
];

for (const path of PAGES) {
  test(`axe: no serious/critical violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    // Let mount-triggered entrance transitions (e.g. the home pipeline
    // panel's opacity/transform crossfade) finish so axe scans a settled
    // frame rather than a transient near-zero-opacity one.
    await page.waitForTimeout(400);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    if (serious.length > 0) {
      console.log(JSON.stringify(serious, null, 2));
    }
    expect(serious, `Serious/critical a11y violations on ${path}`).toEqual([]);
  });
}

test("axe: custom 404 page", async ({ page }) => {
  await page.goto("/this-route-does-not-exist");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  if (serious.length > 0) {
    console.log(JSON.stringify(serious, null, 2));
  }
  expect(serious).toEqual([]);
});
