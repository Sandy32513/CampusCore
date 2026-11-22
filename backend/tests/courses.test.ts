import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("Course Management Integration Tests (V8)", () => {
  const app = createApp();
  let adminCookie: string;
  let studentCookie: string;
  let createdCourseId: string;

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
        email: "course.student@campuscore.edu",
        password: "StudentPass123!",
        firstName: "Course",
        lastName: "Student",
        role: "STUDENT"
      });

    const studentLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "course.student@campuscore.edu", password: "StudentPass123!" });
    studentCookie = studentLogin.headers["set-cookie"][0].split(";")[0];
  });

  it("GET /api/v1/courses should return list of courses with department mapping", async () => {
    const res = await request(app)
      .get("/api/v1/courses")
      .set("Cookie", studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.courses).toBeInstanceOf(Array);
    expect(res.body.data.courses.length).toBeGreaterThanOrEqual(1);

    const first = res.body.data.courses[0];
    expect(first.code).toBeDefined();
    expect(first.departmentId).toBeDefined();
  });

  it("POST /api/v1/courses as Student should be rejected with 403 Forbidden", async () => {
    const res = await request(app)
      .post("/api/v1/courses")
      .set("Cookie", studentCookie)
      .send({
        departmentId: "1",
        code: "BTECH-MECH",
        name: "Bachelor of Technology in Mechanical Engineering"
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/v1/courses with invalid departmentId should return 404 Not Found", async () => {
    const res = await request(app)
      .post("/api/v1/courses")
      .set("Cookie", adminCookie)
      .send({
        departmentId: "999999",
        code: "BTECH-CIVIL",
        name: "Bachelor of Technology in Civil Engineering",
        durationYears: 4.0,
        totalCredits: 160
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("DEPARTMENT_NOT_FOUND");
  });

  it("POST /api/v1/courses as Admin should successfully create a course", async () => {
    const res = await request(app)
      .post("/api/v1/courses")
      .set("Cookie", adminCookie)
      .send({
        departmentId: "1",
        code: "btech-ai",
        name: "Bachelor of Technology in Artificial Intelligence",
        degreeLevel: "UNDERGRADUATE",
        durationYears: 4.0,
        totalCredits: 160,
        description: "Specialized undergraduate AI curriculum"
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.course.code).toBe("BTECH-AI");
    expect(res.body.data.course.name).toBe("Bachelor of Technology in Artificial Intelligence");
    expect(res.body.data.course.durationYears).toBe(4.0);
    expect(res.body.data.course.isActive).toBe(true);

    createdCourseId = res.body.data.course.id;
  });

  it("POST /api/v1/courses with duplicate code should return 409 Conflict", async () => {
    const res = await request(app)
      .post("/api/v1/courses")
      .set("Cookie", adminCookie)
      .send({
        departmentId: "1",
        code: "BTECH-AI",
        name: "Duplicate AI Course",
        durationYears: 4.0,
        totalCredits: 160
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("DUPLICATE_CODE");
  });

  it("GET /api/v1/courses/:id should return course details and statistics", async () => {
    const res = await request(app)
      .get(`/api/v1/courses/${createdCourseId}`)
      .set("Cookie", studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.course.id).toBe(createdCourseId);
    expect(res.body.data.course.code).toBe("BTECH-AI");
    expect(res.body.data.course.stats).toBeDefined();
    expect(res.body.data.course.stats.studentCount).toBe(0);
  });

  it("PUT /api/v1/courses/:id as Admin should update course metadata", async () => {
    const res = await request(app)
      .put(`/api/v1/courses/${createdCourseId}`)
      .set("Cookie", adminCookie)
      .send({
        name: "B.Tech in Artificial Intelligence & Machine Learning",
        totalCredits: 165
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.course.name).toBe("B.Tech in Artificial Intelligence & Machine Learning");
    expect(res.body.data.course.totalCredits).toBe(165);
  });

  it("PATCH /api/v1/courses/:id/status should toggle active status", async () => {
    const res = await request(app)
      .patch(`/api/v1/courses/${createdCourseId}/status`)
      .set("Cookie", adminCookie)
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.course.isActive).toBe(false);
  });
});
