import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("Backup & Recovery Integration Tests (V40)", () => {
  const app = createApp();
  let adminCookie: string;
  let studentCookie: string;
  let createdBackupId: string;

  beforeAll(async () => {
    const adminLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@campuscore.edu", password: "Admin@123456" });
    adminCookie = adminLogin.headers["set-cookie"][0].split(";")[0];

    await request(app)
      .post("/api/v1/users")
      .set("Cookie", adminCookie)
      .send({
        email: "backup.student@campuscore.edu",
        password: "StudentPass123!",
        firstName: "Backup",
        lastName: "Student",
        role: "STUDENT"
      });

    const studentLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "backup.student@campuscore.edu", password: "StudentPass123!" });
    studentCookie = studentLogin.headers["set-cookie"][0].split(";")[0];
  });

  it("GET /api/v1/backups as Admin should return list of backups", async () => {
    const res = await request(app)
      .get("/api/v1/backups")
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.backups).toBeInstanceOf(Array);
    expect(res.body.data.backups).toHaveLength(1);
    expect(res.body.data.backups[0].filename).toBe("backup_baseline_20261122.sql");
  });

  it("POST /api/v1/backups as Student should be rejected with 403 Forbidden", async () => {
    const res = await request(app)
      .post("/api/v1/backups")
      .set("Cookie", studentCookie)
      .send({ backupType: "FULL" });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("POST /api/v1/backups as Super Admin should trigger automated backup dump", async () => {
    const res = await request(app)
      .post("/api/v1/backups")
      .set("Cookie", adminCookie)
      .send({
        backupType: "FULL",
        retentionDays: 14,
        notes: "Automated test integration snapshot"
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.backup.filename).toContain("backup_");
    expect(res.body.data.backup.status).toBe("COMPLETED");
    expect(res.body.data.backup.checksumSha256).toBeDefined();

    createdBackupId = res.body.data.backup.id;
  });

  it("GET /api/v1/backups/:id/verify should verify file existence and SHA256 integrity", async () => {
    const res = await request(app)
      .get(`/api/v1/backups/${createdBackupId}/verify`)
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.verification.id).toBe(createdBackupId);
    expect(res.body.data.verification.exists).toBe(true);
    expect(res.body.data.verification.isValid).toBe(true);
  });

  it("POST /api/v1/backups/:id/restore restores and verifies only an isolated scratch database", async () => {
    const res = await request(app)
      .post(`/api/v1/backups/${createdBackupId}/restore`)
      .set("Cookie", adminCookie)
      .send({ targetDatabase: "sms_audit_restore_v40" });

    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.restoreResult.restored).toBe(true);
  });

  it("DELETE /api/v1/backups/:id as Super Admin should delete backup snapshot", async () => {
    const res = await request(app)
      .delete(`/api/v1/backups/${createdBackupId}`)
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const checkRes = await request(app)
      .get(`/api/v1/backups/${createdBackupId}/verify`)
      .set("Cookie", adminCookie);
    expect(checkRes.status).toBe(404);
  });
});
