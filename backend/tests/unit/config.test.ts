import { describe, expect, it } from "vitest";
import { createAppConfig } from "../../src/config/env.js";

describe("runtime configuration", () => {
  it("uses an isolated audit database as the integration-test default", () => {
    const config = createAppConfig({ NODE_ENV: "test" });

    expect(config.db.database).toBe("sms_audit_test");
  });

  it("rejects sms_test as a destructive integration-test target", () => {
    expect(() => createAppConfig({ NODE_ENV: "test", DB_TEST_NAME: "sms_test" }))
      .toThrow("DB_TEST_NAME must use the sms_audit_* prefix");
  });

  it("normalizes and deduplicates valid HTTP origins", () => {
    const config = createAppConfig({
      APP_BASE_URL: "https://campus.example/app",
      CORS_ORIGINS: "https://campus.example,https://admin.example/"
    });

    expect(config.corsOrigins).toEqual(["https://campus.example", "https://admin.example"]);
  });

  it("validates ports and production cookie origins", () => {
    expect(() => createAppConfig({ API_PORT: "5000abc" })).toThrow("API_PORT must be an integer");
    expect(() => createAppConfig({ NODE_ENV: "production", APP_BASE_URL: "http://campus.example" }))
      .toThrow("APP_BASE_URL must use HTTPS in production");
  });
});
