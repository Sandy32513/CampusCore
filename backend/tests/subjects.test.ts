import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("Subject Management Integration Tests (V9)", () => {
  const app = createApp();
  let adminCookie: string;
  let studentCookie: string;
  let createdSubjectId: string;

  beforeAll(async () => {
    const adminLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@campuscore.edu", password: "Admin@123456" });
    adminCookie = adminLogin.headers["set-cookie"][0].split(";")[0];

    await request(app)
      .post("/api/v1/users")
      .set("Cookie", adminCookie)
      .send({
        email: "subject.student@campuscore.edu",
        password: "StudentPass123!",
        firstName: "Subject",
        lastName: "Student",
        role: "STUDENT"
      });

    const studentLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "subject.student@campuscore.edu", password: "StudentPass123!" });
    studentCookie = studentLogin.headers["set-cookie"][0].split(";")[0];
  });

  it("GET /api/v1/subjects should return list of academic subjects", async () => {
    const res = await request(app)
      .get("/api/v1/subjects")
      .set("Cookie", studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.subjects).toBeInstanceOf(Array);
    expect(res.body.data.subjects.length).toBeGreaterThanOrEqual(1);

    const first = res.body.data.subjects[0];
    expect(first.code).toBeDefined();
    expect(first.credits).toBeGreaterThanOrEqual(1);
  });

  it("POST /api/v1/subjects as Student should be rejected with 403 Forbidden", async () => {
    const res = await request(app)
      .post("/api/v1/subjects")
      .set("Cookie", studentCookie)
      .send({
        code: "CS999",
        name: "Forbidden Subject",
        departmentId: "1"
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("POST /api/v1/subjects as Admin should create new subject", async () => {
    const res = await request(app)
      .post("/api/v1/subjects")
      .set("Cookie", adminCookie)
      .send({
        code: "CS201-OS",
        name: "Operating Systems Principles",
        departmentId: "1",
        type: "THEORY",
        credits: 4,
        theoryCredits: 3,
        practicalCredits: 1,
        isElective: false,
        description: "Kernel architecture, process scheduling, concurrency, virtual memory."
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.subject.code).toBe("CS201-OS");
    expect(res.body.data.subject.name).toBe("Operating Systems Principles");
    expect(res.body.data.subject.credits).toBe(4);

    createdSubjectId = res.body.data.subject.id;
  });

  it("POST /api/v1/subjects with duplicate code should return 409 Conflict", async () => {
    const res = await request(app)
      .post("/api/v1/subjects")
      .set("Cookie", adminCookie)
      .send({
        code: "CS201-OS",
        name: "Duplicate Operating Systems",
        departmentId: "1"
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("DUPLICATE_CODE");
  });

  it("GET /api/v1/subjects/:id should return single subject with course mappings", async () => {
    const res = await request(app)
      .get(`/api/v1/subjects/${createdSubjectId}`)
      .set("Cookie", studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.subject.id).toBe(createdSubjectId);
    expect(res.body.data.subject.code).toBe("CS201-OS");
    expect(res.body.data.subject.courses).toBeInstanceOf(Array);
  });

  it("PUT /api/v1/subjects/:id as Admin should update subject metadata", async () => {
    const res = await request(app)
      .put(`/api/v1/subjects/${createdSubjectId}`)
      .set("Cookie", adminCookie)
      .send({
        name: "Operating Systems & Concurrency",
        credits: 5
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.subject.name).toBe("Operating Systems & Concurrency");
    expect(res.body.data.subject.credits).toBe(5);
  });

  it("PATCH /api/v1/subjects/:id/status should toggle active status", async () => {
    const res = await request(app)
      .patch(`/api/v1/subjects/${createdSubjectId}/status`)
      .set("Cookie", adminCookie)
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.subject.isActive).toBe(false);
  });

  it("POST /api/v1/subjects/:id/courses should map subject to course semester", async () => {
    const res = await request(app)
      .post(`/api/v1/subjects/${createdSubjectId}/courses`)
      .set("Cookie", adminCookie)
      .send({
        courseId: "1",
        semesterNumber: 3,
        isMandatory: true
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.mapping.courseId).toBe("1");
    expect(res.body.data.mapping.semesterNumber).toBe(3);
  });

  it("DELETE /api/v1/subjects/:id/courses/:courseId should unmap subject from course", async () => {
    const res = await request(app)
      .delete(`/api/v1/subjects/${createdSubjectId}/courses/1`)
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
