import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("User & Role Management Integration Tests (V3)", () => {
  const app = createApp();
  let adminCookie: string;
  let studentCookie: string;
  let createdUserId: string;

  beforeAll(async () => {
    // 1. Login as default Admin
    const adminLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@campuscore.edu", password: "Admin@123456" });
    adminCookie = adminLogin.headers["set-cookie"][0].split(";")[0];

    // 2. Create a student user for role guard testing
    const createStudent = await request(app)
      .post("/api/v1/users")
      .set("Cookie", adminCookie)
      .send({
        email: "student.test@campuscore.edu",
        password: "StudentPass123!",
        firstName: "Test",
        lastName: "Student",
        role: "STUDENT"
      });
    expect(createStudent.status).toBe(201);

    // 3. Login as student
    const studentLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "student.test@campuscore.edu", password: "StudentPass123!" });
    studentCookie = studentLogin.headers["set-cookie"][0].split(";")[0];
  });

  it("GET /api/v1/users as Admin should return paginated list of users", async () => {
    const res = await request(app)
      .get("/api/v1/users?page=1&pageSize=10")
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.users).toBeInstanceOf(Array);
    expect(res.body.data.users.length).toBeGreaterThanOrEqual(2);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(2);
  });

  it("GET /api/v1/users as Student should be rejected with 403 Forbidden", async () => {
    const res = await request(app)
      .get("/api/v1/users")
      .set("Cookie", studentCookie);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("POST /api/v1/users as Admin should create a new Teacher", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .set("Cookie", adminCookie)
      .send({
        email: "prof.oak@campuscore.edu",
        password: "FacultyPass123!",
        firstName: "Samuel",
        lastName: "Oak",
        role: "TEACHER"
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe("prof.oak@campuscore.edu");
    expect(res.body.data.user.role).toBe("TEACHER");
    expect(res.body.data.user.passwordHash).toBeUndefined(); // Never expose hash
    createdUserId = res.body.data.user.id;
  });

  it("POST /api/v1/users with duplicate email should return 409 Conflict", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .set("Cookie", adminCookie)
      .send({
        email: "prof.oak@campuscore.edu",
        password: "AnotherPassword123!",
        firstName: "Duplicate",
        lastName: "User",
        role: "TEACHER"
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("PUT /api/v1/users/:id should update user profile", async () => {
    const res = await request(app)
      .put(`/api/v1/users/${createdUserId}`)
      .set("Cookie", adminCookie)
      .send({ firstName: "Professor", lastName: "Oak" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.firstName).toBe("Professor");
  });

  it("PATCH /api/v1/users/:id/status should deactivate user and revoke their sessions", async () => {
    // 1. Login as the target user to establish an active session
    const loginTarget = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "prof.oak@campuscore.edu", password: "FacultyPass123!" });
    expect(loginTarget.status).toBe(200);
    const targetCookie = loginTarget.headers["set-cookie"][0].split(";")[0];

    // 2. Deactivate the user
    const deactivateRes = await request(app)
      .patch(`/api/v1/users/${createdUserId}/status`)
      .set("Cookie", adminCookie)
      .send({ isActive: false });

    expect(deactivateRes.status).toBe(200);
    expect(deactivateRes.body.data.user.isActive).toBe(false);

    // 3. Verify user's session is immediately revoked on next request
    const checkMe = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", targetCookie);

    expect(checkMe.status).toBe(401);
  });

  it("PATCH /api/v1/users/:id/status self-deactivation by admin should return 400 Bad Request", async () => {
    const res = await request(app)
      .patch("/api/v1/users/1/status")
      .set("Cookie", adminCookie)
      .send({ isActive: false });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("BAD_REQUEST");
  });

  it("POST /api/v1/users/:id/reset-password should reset password and revoke active sessions", async () => {
    const res = await request(app)
      .post(`/api/v1/users/${createdUserId}/reset-password`)
      .set("Cookie", adminCookie)
      .send({ newPassword: "NewSecurePassword123!" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tempPassword).toBe("NewSecurePassword123!");

    // Reactivate to test new password login
    await request(app)
      .patch(`/api/v1/users/${createdUserId}/status`)
      .set("Cookie", adminCookie)
      .send({ isActive: true });

    const newLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "prof.oak@campuscore.edu", password: "NewSecurePassword123!" });
    expect(newLogin.status).toBe(200);
  });

  it("GET /api/v1/roles should list the 6 canonical roles", async () => {
    const res = await request(app)
      .get("/api/v1/roles")
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.roles).toHaveLength(6);
    const roleNames = res.body.data.roles.map((role: { name: string }) => role.name);
    expect(roleNames).toContain("SUPER_ADMIN");
    expect(roleNames).toContain("ADMIN");
    expect(roleNames).toContain("TEACHER");
    expect(roleNames).toContain("STAFF");
    expect(roleNames).toContain("STUDENT");
    expect(roleNames).toContain("PARENT");
  });
});
