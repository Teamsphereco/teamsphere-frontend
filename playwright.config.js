import { defineConfig, devices } from "@playwright/test";

const frontendUrl = process.env.E2E_FRONTEND_URL || "http://localhost:3000";
const backendUrl = process.env.E2E_API_URL || "http://localhost:5454";

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["html"], ["github"]] : "list",
  use: {
    baseURL: frontendUrl,
    trace: "on-first-retry",
    video: "retain-on-failure",
    permissions: ["camera", "microphone"],
    launchOptions: {
      args: [
        "--use-fake-device-for-media-stream",
        "--use-fake-ui-for-media-stream",
      ],
    },
  },
  webServer: {
    command: "npm run dev -- --host localhost",
    url: frontendUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      VITE_API_HOST: backendUrl,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});