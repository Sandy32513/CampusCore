import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("Modules API Integration Test", () => {
  const app = createApp();

  it("GET /api/v1/modules should return the module catalog", async () => {
    const res = await request(app).get("/api/v1/modules");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.modules).toBeInstanceOf(Array);
    expect(res.body.data.modules.length).toBeGreaterThan(5);

    const foundation = res.body.data.modules.find((m: any) => m.id === "v0-foundation");
    expect(foundation).toBeDefined();
    expect(foundation.status).toBe("FROZEN");

    const students = res.body.data.modules.find((m: any) => m.id === "v4-students");
    expect(students).toBeDefined();
    expect(["COMING_SOON", "BUILDING", "FROZEN"]).toContain(students.status);
    expect(students.wave).toBe(7);
  });

  it("GET /api/v1/modules/:slug should return a single module", async () => {
    const res = await request(app).get("/api/v1/modules/students");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Student Management");
  });

  it("GET /api/v1/modules/:slug should return 404 for unknown module", async () => {
    const res = await request(app).get("/api/v1/modules/non-existent");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("MODULE_NOT_FOUND");
  });
});
