import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("Student Management Integration Tests (V4)", () => {
  const app = createApp();
  let adminCookie: string;
  let studentCookie: string;
  let createdStudentId: string;

  beforeAll(async () => {
    const adminLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@campuscore.edu", password: "Admin@123456" });
    adminCookie = adminLogin.headers["set-cookie"][0].split(";")[0];

    const studentLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "demo.student@campuscore.edu", password: "StudentPass123!" });
    studentCookie = studentLogin.headers["set-cookie"][0].split(";")[0];
  });

  it("GET /api/v1/students should return paginated list of students with mappings", async () => {
    const res = await request(app)
      .get("/api/v1/students")
      .set("Cookie", studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.students).toBeInstanceOf(Array);
    expect(res.body.data.students.length).toBeGreaterThanOrEqual(1);

    const first = res.body.data.students[0];
    expect(first.admissionNumber).toBe("ADM2026001");
    expect(first.departmentId).toBeDefined();
    expect(first.courseId).toBeDefined();
  });

  it("POST /api/v1/students as Student should be rejected with 403 Forbidden", async () => {
    const res = await request(app)
      .post("/api/v1/students")
      .set("Cookie", studentCookie)
      .send({
        admissionNumber: "ADM999001",
        firstName: "Forbidden",
        lastName: "Applicant",
        email: "forbidden@campuscore.edu",
        dateOfBirth: "2005-01-01",
        departmentId: "1",
        courseId: "1",
        currentSemesterId: "1",
        admissionDate: "2026-08-01"
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("POST /api/v1/students as Admin should admit and create new student", async () => {
    const res = await request(app)
      .post("/api/v1/students")
      .set("Cookie", adminCookie)
      .send({
        admissionNumber: "ADM2026999",
        rollNumber: "26CSE999",
        firstName: "Grace",
        lastName: "Hopper",
        email: "grace.hopper@campuscore.edu",
        phone: "+1-555-0198",
        dateOfBirth: "2004-12-09",
        gender: "FEMALE",
        bloodGroup: "A+",
        departmentId: "1",
        courseId: "1",
        currentSemesterId: "1",
        admissionDate: "2026-08-01",
        status: "ACTIVE",
        emergencyContactName: "Rear Admiral Hopper",
        emergencyContactPhone: "+1-555-0199",
        city: "Arlington",
        state: "VA"
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.student.admissionNumber).toBe("ADM2026999");
    expect(res.body.data.student.firstName).toBe("Grace");
    expect(res.body.data.student.status).toBe("ACTIVE");

    createdStudentId = res.body.data.student.id;
  });

  it("POST /api/v1/students with duplicate email should return 409 Conflict", async () => {
    const res = await request(app)
      .post("/api/v1/students")
      .set("Cookie", adminCookie)
      .send({
        admissionNumber: "ADM2026888",
        firstName: "Duplicate",
        lastName: "Hopper",
        email: "grace.hopper@campuscore.edu",
        dateOfBirth: "2004-12-09",
        departmentId: "1",
        courseId: "1",
        currentSemesterId: "1",
        admissionDate: "2026-08-01"
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("DUPLICATE_EMAIL");
  });

  it("GET /api/v1/students/:id should return the linked student's details", async () => {
    const res = await request(app)
      .get("/api/v1/students/1")
      .set("Cookie", studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.student.id).toBe("1");
    expect(res.body.data.student.email).toBe("demo.student@campuscore.edu");
    expect(res.body.data.student.departmentName).toBeDefined();
  });

  it("GET /api/v1/students/:id should hide another student's profile", async () => {
    const res = await request(app)
      .get(`/api/v1/students/${createdStudentId}`)
      .set("Cookie", studentCookie);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("PUT /api/v1/students/:id as Admin should update profile fields", async () => {
    const res = await request(app)
      .put(`/api/v1/students/${createdStudentId}`)
      .set("Cookie", adminCookie)
      .send({
        phone: "+1-555-9999",
        city: "Washington",
        emergencyContactName: "Dr. Grace Hopper Sr."
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.student.phone).toBe("+1-555-9999");
    expect(res.body.data.student.city).toBe("Washington");
  });

  it("PATCH /api/v1/students/:id/status should update status to SUSPENDED", async () => {
    const res = await request(app)
      .patch(`/api/v1/students/${createdStudentId}/status`)
      .set("Cookie", adminCookie)
      .send({ status: "SUSPENDED" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.student.status).toBe("SUSPENDED");
  });

  it("DELETE /api/v1/students/:id as Super Admin should remove student record", async () => {
    const res = await request(app)
      .delete(`/api/v1/students/${createdStudentId}`)
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const checkRes = await request(app)
      .get(`/api/v1/students/${createdStudentId}`)
      .set("Cookie", adminCookie);
    expect(checkRes.status).toBe(404);
  });
});
