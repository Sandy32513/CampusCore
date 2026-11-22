import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("Health API Integration Test", () => {
  const app = createApp();

  it("GET /health should return 200 with standard response structure", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.version).toBe("0.0.0");
    expect(typeof res.body.data.uptime).toBe("number");
    expect(typeof res.body.data.timestamp).toBe("string");
    expect(["healthy", "degraded"]).toContain(res.body.data.status);
    expect(["connected", "disconnected"]).toContain(res.body.data.database);
  });

  it("GET /api/v1/health alias should match root health response", async () => {
    const res = await request(app).get("/api/v1/health");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.version).toBe("0.0.0");
  });
});
