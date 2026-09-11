import { test, expect } from "@playwright/test";

/**
 * Real upload -> backend -> result round trip against a genuinely running
 * services/analyzer instance — the proof (not just an assertion) that a
 * real uploaded contract reaches a real analysis result: real findings,
 * a non-null FLARE score, a real fund-flow graph, and a real report
 * download, with zero demo-data fallback anywhere in the path.
 *
 * This suite is skipped unless E2E_ANALYZER_API_URL is set (it is NOT part
 * of the default `pnpm e2e` run or the CI `e2e` job, both of which run
 * against a Next.js dev server with no backend configured — see
 * critical-flow.spec.ts). To run it locally:
 *
 *   docker compose up -d analyzer   # or: docker compose run --rm -d -p 8001:8000 --name flare-analyzer analyzer
 *   E2E_ANALYZER_API_URL=http://localhost:8001 \
 *   NEXT_PUBLIC_ANALYZER_API_URL=http://localhost:8001 \
 *   npx playwright test tests/e2e/live-analysis.spec.ts
 */

const LIVE_API = process.env.E2E_ANALYZER_API_URL;

test.skip(!LIVE_API, "E2E_ANALYZER_API_URL not set — see file header for how to run this suite locally");

test("a real benchmark submission reaches a real, non-demo analysis result", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/app/analysis/new");
  await page.getByRole("button", { name: "Benchmark Case" }).click();

  const select = page.getByLabel("Built-in benchmark case");
  await select.selectOption({ value: "flare-wd-001/vulnerable.sol" });

  await page.getByRole("button", { name: "Run Analysis" }).click();

  // A real, multi-stage pipeline run — not an instant fake result — proven
  // by waiting for the actual redirect (only fires on a real "complete"
  // status from the backend) rather than asserting on the progress
  // indicator's transient text, which can flash by too fast to catch on a
  // small, fast-compiling fixture.
  await page.waitForURL(/\/app\/analysis\/[a-f0-9]{16,}$/, { timeout: 60_000 });

  await expect(page.getByText("LIVE ENGINE")).toBeVisible();

  // A real, non-null FLARE score — never "—".
  const scoreCard = page.getByText("FLARE Score", { exact: true }).locator("..");
  await expect(scoreCard).not.toContainText("—");

  await page.getByRole("tab", { name: "Findings" }).click();
  const firstFinding = page.locator("button[aria-expanded]").filter({ hasText: /FLARE-/ }).first();
  await expect(firstFinding).toBeVisible();
  await firstFinding.click();
  await expect(page.getByText("Source").first()).toBeVisible();

  await page.getByRole("tab", { name: "Asset Flow" }).click();
  await expect(page.locator(".react-flow__node").first()).toBeVisible();

  await page.getByRole("tab", { name: "Report" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download JSON/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^flare-report-.+\.json$/);
});

test("the dashboard shows this real analysis, not demo fixtures", async ({ page }) => {
  await page.goto("/app");
  await expect(page.getByText("LIVE ENGINE").first()).toBeVisible();
  // demo-vaultline and friends must not appear once a live backend is configured.
  await expect(page.locator('a[href="/app/analysis/demo-vaultline"]')).toHaveCount(0);
});

test("submitting an invalid GitHub URL surfaces the backend's real validation error", async ({ page }) => {
  test.setTimeout(60_000); // the backend's own git-clone attempt can take up to 30s to time out
  await page.goto("/app/analysis/new");
  await page.getByRole("button", { name: "GitHub URL" }).click();
  await page.getByLabel("Public GitHub repository URL").fill("https://github.com/this-owner-does-not-exist-flare-test/nope");
  await page.getByRole("button", { name: "Run Analysis" }).click();
  // The backend's own git-clone attempt has a 30s timeout before it raises
  // IntakeError — give this real round trip real headroom.
  await expect(page.getByText(/could not clone|not a valid public github/i)).toBeVisible({ timeout: 45_000 });
});
