import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("System Settings Integration Tests (V39)", () => {
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
        email: "settings.student@campuscore.edu",
        password: "StudentPass123!",
        firstName: "Settings",
        lastName: "Student",
        role: "STUDENT"
      });

    const studentLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "settings.student@campuscore.edu", password: "StudentPass123!" });
    studentCookie = studentLogin.headers["set-cookie"][0].split(";")[0];
  });

  it("GET /api/v1/settings/public should return public institutional branding without authentication", async () => {
    const res = await request(app).get("/api/v1/settings/public");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.settings.institutionName).toBeDefined();
    expect(res.body.data.settings.timezone).toBeDefined();
    expect(res.body.data.settings.currency).toBeDefined();
    // Sensitive keys must not be present in public DTO
    expect(res.body.data.settings.session_timeout_minutes).toBeUndefined();
  });

  it("GET /api/v1/settings as authenticated user should return complete settings map", async () => {
    const res = await request(app)
      .get("/api/v1/settings")
      .set("Cookie", studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.settings.institution_name).toBeDefined();
    expect(res.body.data.settings.session_timeout_minutes).toBeDefined();
  });

  it("PUT /api/v1/settings as Student should be rejected with 403 Forbidden", async () => {
    const res = await request(app)
      .put("/api/v1/settings")
      .set("Cookie", studentCookie)
      .send({
        institution_name: "Hacked University"
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("PUT /api/v1/settings as Super Admin should successfully update configuration", async () => {
    const res = await request(app)
      .put("/api/v1/settings")
      .set("Cookie", adminCookie)
      .send({
        institution_name: "CampusCore Institute of Technology",
        attendance_threshold_pct: "80"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.settings.institution_name).toBe("CampusCore Institute of Technology");
    expect(res.body.data.settings.attendance_threshold_pct).toBe("80");

    // Verify public endpoint reflects change
    const publicRes = await request(app).get("/api/v1/settings/public");
    expect(publicRes.body.data.settings.institutionName).toBe("CampusCore Institute of Technology");
    expect(publicRes.body.data.settings.attendanceThresholdPct).toBe(80);
  });
});
