import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { config } from "../../src/config/env.js";
import { csrfProtection } from "../../src/middleware/csrfProtection.js";
import { loginRateLimit } from "../../src/middleware/authRateLimit.js";

describe("request security middleware", () => {
  it("rejects disallowed origins and browser mutations without the custom header", async () => {
    const app = express();
    app.use(csrfProtection);
    app.post("/mutation", (_req, res) => res.sendStatus(204));

    const foreignOrigin = await request(app).post("/mutation").set("Origin", "https://attacker.example");
    const missingHeader = await request(app)
      .post("/mutation")
      .set("Origin", config.corsOrigins[0]);
    const allowed = await request(app)
      .post("/mutation")
      .set("Origin", config.corsOrigins[0])
      .set("X-CSRF-Protection", "1");

    expect(foreignOrigin.status).toBe(403);
    expect(missingHeader.status).toBe(403);
    expect(allowed.status).toBe(204);
  });

  it("limits repeated failed login attempts from a client", async () => {
    const app = express();
    app.post("/login", loginRateLimit, (_req, res) => res.sendStatus(401));
    const responses = [];
    for (let attempt = 0; attempt < 11; attempt += 1) {
      responses.push(await request(app).post("/login"));
    }

    expect(responses.slice(0, 10).every((response) => response.status === 401)).toBe(true);
    expect(responses[10].status).toBe(429);
    expect(responses[10].headers["retry-after"]).toBeDefined();
  });
});
