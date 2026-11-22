import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("Department Management Integration Tests (V7)", () => {
  const app = createApp();
  let adminCookie: string;
  let studentCookie: string;
  let createdDeptId: string;

  beforeAll(async () => {
    // 1. Login as Admin
    const adminLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@campuscore.edu", password: "Admin@123456" });
    adminCookie = adminLogin.headers["set-cookie"][0].split(";")[0];

    // 2. Create student user and login
    await request(app)
      .post("/api/v1/users")
      .set("Cookie", adminCookie)
      .send({
        email: "dept.student@campuscore.edu",
        password: "StudentPass123!",
        firstName: "Dept",
        lastName: "Student",
        role: "STUDENT"
      });

    const studentLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "dept.student@campuscore.edu", password: "StudentPass123!" });
    studentCookie = studentLogin.headers["set-cookie"][0].split(";")[0];
  });

  it("GET /api/v1/departments should return list of seeded departments", async () => {
    const res = await request(app)
      .get("/api/v1/departments")
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.departments).toBeInstanceOf(Array);
    expect(res.body.data.departments.length).toBeGreaterThanOrEqual(2);
  });

  it("POST /api/v1/departments as Student should be rejected with 403 Forbidden", async () => {
    const res = await request(app)
      .post("/api/v1/departments")
      .set("Cookie", studentCookie)
      .send({
        code: "MECH",
        name: "Mechanical Engineering"
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("POST /api/v1/departments as Admin should create a new department and uppercase code", async () => {
    const res = await request(app)
      .post("/api/v1/departments")
      .set("Cookie", adminCookie)
      .send({
        code: "mech",
        name: "Mechanical Engineering",
        description: "Department of Mechanical Engineering",
        headOfDepartment: "Dr. Rudolf Diesel"
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.department.code).toBe("MECH");
    expect(res.body.data.department.name).toBe("Mechanical Engineering");
    expect(res.body.data.department.isActive).toBe(true);
    expect(res.body.data.department.stats).toBeDefined();

    createdDeptId = res.body.data.department.id;
  });

  it("POST /api/v1/departments with duplicate code should return 409 Conflict", async () => {
    const res = await request(app)
      .post("/api/v1/departments")
      .set("Cookie", adminCookie)
      .send({
        code: "MECH",
        name: "Mechanical Engineering Duplicate"
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("DUPLICATE_CODE");
  });

  it("GET /api/v1/departments/:id should return department details with stats", async () => {
    const res = await request(app)
      .get(`/api/v1/departments/${createdDeptId}`)
      .set("Cookie", studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.department.id).toBe(createdDeptId);
    expect(res.body.data.department.code).toBe("MECH");
    expect(res.body.data.department.stats.courseCount).toBe(0);
  });

  it("PUT /api/v1/departments/:id as Admin should update department details", async () => {
    const res = await request(app)
      .put(`/api/v1/departments/${createdDeptId}`)
      .set("Cookie", adminCookie)
      .send({
        name: "Department of Mechanical & Aerospace Engineering",
        headOfDepartment: "Dr. Kelly Johnson"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.department.name).toBe("Department of Mechanical & Aerospace Engineering");
    expect(res.body.data.department.headOfDepartment).toBe("Dr. Kelly Johnson");
  });

  it("PATCH /api/v1/departments/:id/status should toggle active status", async () => {
    const res = await request(app)
      .patch(`/api/v1/departments/${createdDeptId}/status`)
      .set("Cookie", adminCookie)
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.department.isActive).toBe(false);
  });
});
