const path = require("node:path");
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./frontend/tests/e2e",
  fullyParallel: true,
  reporter: "list",
  outputDir: "./test-results",
  use: {
    baseURL: "http://127.0.0.1:3000",
    browserName: "chromium",
    trace: "retain-on-failure"
  },
  webServer: {
    command: "npm run start --workspace=frontend",
    cwd: path.resolve(__dirname),
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  }
});
