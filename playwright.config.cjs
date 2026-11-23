const path = require("node:path");
const { defineConfig } = require("@playwright/test");

const baseURL = "http://localhost:3000";
const webServers = [];

if (process.env.E2E_LIVE_BACKEND === "1") {
  webServers.push({
    command: "npm run start --workspace=backend",
    cwd: path.resolve(__dirname),
    url: "http://localhost:5000/api/v1/health",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  });
}

webServers.push({
  command: "npm run start --workspace=frontend",
  cwd: path.resolve(__dirname),
  url: baseURL,
  reuseExistingServer: !process.env.CI,
  timeout: 30_000
});

module.exports = defineConfig({
  testDir: "./frontend/tests/e2e",
  fullyParallel: true,
  reporter: "list",
  outputDir: "./test-results",
  use: {
    baseURL,
    browserName: "chromium",
    trace: "retain-on-failure"
  },
  webServer: webServers
});
