import { defineConfig } from "@playwright/test";

// E2E_PORT lets the suite dodge other dev servers on :3000
// (e.g. `E2E_PORT=3100 npm run test:e2e`).
const port = Number(process.env.E2E_PORT ?? 3000);

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run build && npm run start",
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: { ...process.env, PORT: String(port) } as Record<string, string>,
  },
});
