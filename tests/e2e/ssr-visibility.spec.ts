import { test, expect } from "@playwright/test";

/**
 * Regression test for a real bug: Motion applies a component's `initial`
 * prop as a synchronous inline style during Next.js SSR. Any above-the-fold
 * element using `initial={{ opacity: 0, ... }}` (whether driven by
 * `animate` or `whileInView`) therefore ships `style="opacity:0"` in the
 * raw server-rendered HTML — genuinely invisible to a client that never
 * runs, or hasn't yet run, the reveal JS (no-JS, crawlers, slow hydration).
 *
 * This asserts the raw HTML response (no JS execution at all) never hides
 * the hero, pipeline, or taxonomy content behind opacity:0.
 */
test("home page SSR HTML never hides above-the-fold content with opacity:0", async ({ request, baseURL }) => {
  const response = await request.get(baseURL ?? "/");
  expect(response.ok()).toBe(true);
  const html = await response.text();

  expect(html).not.toMatch(/opacity:\s*0[^.\d]/);
  expect(html).toContain("Can the assets");
  expect(html).toContain("Five ways funds get locked.");
});
