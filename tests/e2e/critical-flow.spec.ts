import { test, expect } from "@playwright/test";

/**
 * End-to-end critical-flow test required by the FLARE build spec:
 * landing page -> docs search -> dashboard -> a benchmark/demo analysis ->
 * inspect a finding -> inspect the asset-flow graph -> download a report ->
 * invalid route -> custom 404.
 *
 * Runs against the real Next.js app with NO backend configured
 * (NEXT_PUBLIC_ANALYZER_API_URL unset for this webServer, matching CI) — the
 * dashboard/history fall back to explicitly DEMO-labeled fixture data, and
 * submitting a real analysis correctly surfaces the "not configured" error
 * rather than a fake result. See tests/e2e/live-analysis.spec.ts for the
 * separate suite that exercises a *real* upload -> backend -> result round
 * trip against a running services/analyzer instance.
 */

test("landing page renders the hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Open App" }).first()).toBeVisible();
});

test("documentation search finds and opens a page", async ({ page }) => {
  await page.goto("/docs");

  // On narrow viewports the search box lives inside the "Sections" drawer
  // rather than the (hidden) sticky sidebar — both exist in the DOM at that
  // width, so scope to whichever container is actually visible.
  const mobileDrawerTrigger = page.getByRole("button", { name: "Sections" });
  let search = page.getByPlaceholder("Search documentation…");
  if (await mobileDrawerTrigger.isVisible()) {
    await mobileDrawerTrigger.click();
    search = page.getByRole("dialog").getByPlaceholder("Search documentation…");
  }
  await search.click();
  await search.fill("detector");

  const option = page.getByRole("option").first();
  await expect(option).toBeVisible();
  await option.click();

  await expect(page).toHaveURL(/\/docs\/.+/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("critical flow: dashboard -> analysis -> finding -> graph -> report download", async ({ page }) => {
  // Open dashboard from the public site nav.
  await page.goto("/");
  await page.getByRole("link", { name: "Open App" }).first().click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText(/Demo \/ Fixture Data/i)).toBeVisible();

  // "Run a benchmark analysis" — /app/analysis/new submits directly to the
  // real backend; with no NEXT_PUBLIC_ANALYZER_API_URL configured for this
  // webServer (matching CI, which doesn't start services/analyzer), the
  // honest, real error surfaces instead of a fake result.
  await page.goto("/app/analysis/new");
  await page.getByRole("button", { name: "Benchmark Case" }).click();
  await expect(page.getByLabel("Built-in benchmark case")).toBeVisible();
  await page.getByRole("button", { name: "Run Analysis" }).click();
  await expect(page.getByText(/analyzer service isn.t configured/i)).toBeVisible();

  // Open a real (demo-labeled) analysis from the dashboard's recent list —
  // this is the benchmark/fixture analysis a visitor can actually inspect.
  // "demo-vaultline" is the fixture with a populated fund-flow graph.
  await page.goto("/app");
  const vaultlineRow = page.locator('a[href="/app/analysis/demo-vaultline"]');
  await expect(vaultlineRow).toBeVisible();
  await vaultlineRow.click();
  await expect(page).toHaveURL(/\/app\/analysis\/demo-vaultline$/);

  // Inspect a finding.
  await page.getByRole("tab", { name: "Findings" }).click();
  // Scope to finding cards specifically (their detector-id badge reads
  // "FLARE-XXX-000") — a generic aria-expanded selector can otherwise match
  // the mobile shell's own nav-drawer toggle button, which is also visible
  // at narrow viewports and appears earlier in the DOM.
  const firstFinding = page.locator("button[aria-expanded]").filter({ hasText: /FLARE-/ }).first();
  await expect(firstFinding).toBeVisible();
  await firstFinding.click();
  await expect(firstFinding).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("Source").first()).toBeVisible();

  // Inspect the asset-flow graph.
  await page.getByRole("tab", { name: "Asset Flow" }).click();
  await expect(page.locator(".react-flow__node").first()).toBeVisible();
  await expect(page.locator(".react-flow__edge").first()).toBeAttached();

  // Download a report.
  await page.getByRole("tab", { name: "Report" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download JSON/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^flare-report-.+\.json$/);
});

test("an invalid route renders the custom 404 page", async ({ page }) => {
  await page.goto("/this-route-does-not-exist");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/not found/i);
  await expect(page.getByRole("link", { name: "Return Home" })).toBeVisible();

  await page.getByRole("link", { name: "Return Home" }).click();
  await expect(page).toHaveURL(/\/$/);
});
