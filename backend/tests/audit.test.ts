import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("Audit Logs Integration Tests (V38)", () => {
  const app = createApp();
  let adminCookie: string;
  let studentCookie: string;

  beforeAll(async () => {
    const adminLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@campuscore.edu", password: "Admin@123456" });
    adminCookie = adminLogin.headers["set-cookie"][0].split(";")[0];

    // Create student user
    await request(app)
      .post("/api/v1/users")
      .set("Cookie", adminCookie)
      .send({
        email: "audit.student@campuscore.edu",
        password: "StudentPass123!",
        firstName: "Audit",
        lastName: "Student",
        role: "STUDENT"
      });

    const studentLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "audit.student@campuscore.edu", password: "StudentPass123!" });
    studentCookie = studentLogin.headers["set-cookie"][0].split(";")[0];

    // Create a department to generate an audit log entry
    await request(app)
      .post("/api/v1/departments")
      .set("Cookie", adminCookie)
      .send({
        code: "AUDIT_DEPT",
        name: "Audit Test Department"
      });
  });

  it("GET /api/v1/audit-logs as Student should be rejected with 403 Forbidden", async () => {
    const res = await request(app)
      .get("/api/v1/audit-logs")
      .set("Cookie", studentCookie);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("GET /api/v1/audit-logs as Admin should return list of recorded events", async () => {
    const res = await request(app)
      .get("/api/v1/audit-logs?page=1&pageSize=20")
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.logs).toBeInstanceOf(Array);
    expect(res.body.data.logs.length).toBeGreaterThanOrEqual(1);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(1);

    const firstLog = res.body.data.logs[0];
    expect(firstLog.id).toBeDefined();
    expect(firstLog.action).toBeDefined();
    expect(firstLog.entity).toBeDefined();
    expect(firstLog.createdAt).toBeDefined();
    expect(firstLog.status).toBe("SUCCESS");
  });

  it("GET /api/v1/audit-logs filter by entity should filter correctly", async () => {
    const res = await request(app)
      .get("/api/v1/audit-logs?entity=DEPARTMENT")
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    if (res.body.data.logs.length > 0) {
      for (const log of res.body.data.logs) {
        expect(log.entity).toBe("DEPARTMENT");
      }
    }
  });

  it("GET /api/v1/audit-logs/:id should return single entry by ID", async () => {
    const listRes = await request(app)
      .get("/api/v1/audit-logs?pageSize=1")
      .set("Cookie", adminCookie);

    const logId = listRes.body.data.logs[0].id;
    const res = await request(app)
      .get(`/api/v1/audit-logs/${logId}`)
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.log.id).toBe(logId);
  });

  it("POST /api/v1/audit-logs should return 404 (strictly append-only via internal service)", async () => {
    const res = await request(app)
      .post("/api/v1/audit-logs")
      .set("Cookie", adminCookie)
      .send({ action: "FAKE_INJECTION" });

    expect(res.status).toBe(404);
  });
});
