import { defineConfig, devices } from "@playwright/test";

/**
 * Drives the Global Admin checks against an already running dev server and backend.
 */
export default defineConfig({
  testDir: "./e2e",
  outputDir: process.env.E2E_ARTIFACTS_DIR ?? "/tmp/opencode/playwright-artifacts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "https://local-avintra.aventisia.com",
    ignoreHTTPSErrors: true,
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
