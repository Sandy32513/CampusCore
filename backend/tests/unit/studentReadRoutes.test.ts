import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  validateSession: vi.fn(),
  listStudents: vi.fn(),
  getStudentById: vi.fn()
}));

vi.mock("../../src/services/authService.js", () => ({
  AuthService: { validateSession: mocks.validateSession }
}));

vi.mock("../../src/services/studentService.js", () => ({
  StudentService: {
    listStudents: mocks.listStudents,
    getStudentById: mocks.getStudentById,
    createStudent: vi.fn(),
    updateStudent: vi.fn(),
    toggleStudentStatus: vi.fn(),
    deleteStudent: vi.fn()
  }
}));

import { studentsRouter } from "../../src/routes/students.js";

const app = express();
app.use(express.json());
app.use("/api/v1/students", studentsRouter);

const sessionUsers = {
  "student-token": { id: "17", email: "student@example.test", firstName: "Test", lastName: "Student", role: "STUDENT", isActive: true, createdAt: "2026-01-01T00:00:00.000Z" },
  "parent-token": { id: "18", email: "parent@example.test", firstName: "Test", lastName: "Parent", role: "PARENT", isActive: true, createdAt: "2026-01-01T00:00:00.000Z" },
  "teacher-token": { id: "19", email: "teacher@example.test", firstName: "Test", lastName: "Teacher", role: "TEACHER", isActive: true, createdAt: "2026-01-01T00:00:00.000Z" }
};

describe("student read authorization routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.validateSession.mockImplementation(async (token: string) =>
      sessionUsers[token as keyof typeof sessionUsers] ?? null
    );
    mocks.listStudents.mockResolvedValue({ students: [], total: 0 });
    mocks.getStudentById.mockResolvedValue(null);
  });

  it("passes the authenticated student's own-account scope to list queries", async () => {
    const response = await request(app)
      .get("/api/v1/students")
      .set("Authorization", "Bearer student-token");

    expect(response.status).toBe(200);
    expect(mocks.listStudents).toHaveBeenCalledWith(
      { page: 1, pageSize: 20 },
      { kind: "self", userId: "17" }
    );
  });

  it("passes the authenticated student's own-account scope to detail queries", async () => {
    const response = await request(app)
      .get("/api/v1/students/44")
      .set("Authorization", "Bearer student-token");

    expect(response.status).toBe(404);
    expect(mocks.getStudentById).toHaveBeenCalledWith("44", { kind: "self", userId: "17" });
  });

  it.each(["/api/v1/students", "/api/v1/students/44"])(
    "denies parent reads at %s until a child relationship is verifiable",
    async (url) => {
      const response = await request(app).get(url).set("Authorization", "Bearer parent-token");

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("STUDENT_ACCESS_UNAVAILABLE");
      expect(mocks.listStudents).not.toHaveBeenCalled();
      expect(mocks.getStudentById).not.toHaveBeenCalled();
    }
  );

  it("keeps the documented staff-wide read access", async () => {
    const response = await request(app)
      .get("/api/v1/students")
      .set("Authorization", "Bearer teacher-token");

    expect(response.status).toBe(200);
    expect(mocks.listStudents).toHaveBeenCalledWith({ page: 1, pageSize: 20 }, { kind: "all" });
  });
});
