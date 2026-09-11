import { defineConfig, devices } from "@playwright/test";

// Locally, drive the system-installed Google Chrome (channel: "chrome") to
// avoid downloading Playwright's own Chromium binary over a slow link. CI
// runners install Playwright's bundled Chromium instead (`playwright install
// --with-deps chromium`), so leave the channel unset there.
const channel = process.env.CI ? undefined : ("chrome" as const);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3100",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], channel } },
    { name: "mobile", use: { ...devices["iPhone 13"], browserName: "chromium", channel } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "pnpm --filter web dev",
        url: "http://localhost:3100",
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
        cwd: __dirname,
        env: {
          PORT: "3100",
          // Passed through only when the caller set it (see
          // tests/e2e/live-analysis.spec.ts's header for how/why) — the
          // default `pnpm e2e` run leaves this unset, so the dev server it
          // spawns has no backend configured, matching CI.
          ...(process.env.NEXT_PUBLIC_ANALYZER_API_URL
            ? { NEXT_PUBLIC_ANALYZER_API_URL: process.env.NEXT_PUBLIC_ANALYZER_API_URL }
            : {}),
        },
      },
});
