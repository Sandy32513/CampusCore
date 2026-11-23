import { vi } from "vitest";
import type { Knex } from "knex";
import { getDb } from "../../src/db/connection.js";
import { AuthService } from "../../src/services/authService.js";
import { DepartmentService } from "../../src/services/departmentService.js";
import { UserService } from "../../src/services/userService.js";
import { AuditService } from "../../src/services/auditService.js";
import { SettingsService } from "../../src/services/settingsService.js";
import { CourseService } from "../../src/services/courseService.js";
import { StudentService } from "../../src/services/studentService.js";
import { SubjectService } from "../../src/services/subjectService.js";
import { AcademicService } from "../../src/services/academicService.js";
import { BackupService } from "../../src/services/backupService.js";

vi.mock("../../src/db/connection.js", () => ({
  getDb: vi.fn()
}));

describe("MySQL-only service behavior", () => {
  it("rejects a department lookup when MySQL is unavailable instead of using memory", async () => {
    const databaseError = Object.assign(new Error("connection refused"), { code: "ECONNREFUSED" });
    vi.mocked(getDb).mockReturnValue(createFailingDb(databaseError));

    await expect(DepartmentService.getDepartmentById("1")).rejects.toBe(databaseError);
  });

  it("does not return a seeded course when MySQL is unavailable", async () => {
    const databaseError = Object.assign(new Error("connection refused"), { code: "ECONNREFUSED" });
    vi.mocked(getDb).mockReturnValue(createFailingDb(databaseError));
    const department = {
      id: "1",
      code: "CSE",
      name: "Computer Science",
      description: null,
      headOfDepartment: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: { courseCount: 0, facultyCount: 0, studentCount: 0 }
    };
    vi.spyOn(DepartmentService, "getDepartmentById").mockResolvedValue(department);

    await expect(CourseService.getCourseById("1")).rejects.toBe(databaseError);
    vi.restoreAllMocks();
  });

  it("does not authenticate any session after a MySQL error", async () => {
    const databaseError = Object.assign(new Error("connection refused"), { code: "ECONNREFUSED" });
    const token = "synthetic-session-token";
    vi.mocked(getDb).mockReturnValue(createFailingDb(databaseError));

    await expect(AuthService.validateSession(token)).rejects.toBe(databaseError);
  });

  it("rejects a user lookup when MySQL is unavailable instead of reading the memory store", async () => {
    const databaseError = Object.assign(new Error("connection refused"), { code: "ECONNREFUSED" });
    vi.mocked(getDb).mockReturnValue(createFailingDb(databaseError));

    await expect(UserService.getUserById("888")).rejects.toBe(databaseError);
  });

  it("does not return seeded audit data when MySQL is unavailable", async () => {
    const databaseError = Object.assign(new Error("connection refused"), { code: "ECONNREFUSED" });
    vi.mocked(getDb).mockReturnValue(createFailingDb(databaseError));

    await expect(AuditService.getLogById("1")).rejects.toBe(databaseError);
  });

  it("does not return default settings after a MySQL failure", async () => {
    const databaseError = Object.assign(new Error("connection refused"), { code: "ECONNREFUSED" });
    vi.mocked(getDb).mockReturnValue(createFailingDb(databaseError));

    await expect(SettingsService.getAllSettings()).rejects.toBe(databaseError);
  });

  it("does not return a seeded student after a MySQL failure", async () => {
    const databaseError = Object.assign(new Error("connection refused"), { code: "ECONNREFUSED" });
    vi.mocked(getDb).mockReturnValue(createFailingDb(databaseError));

    await expect(StudentService.getStudentById("1")).rejects.toBe(databaseError);
  });

  it("does not return a seeded subject after a MySQL failure", async () => {
    const databaseError = Object.assign(new Error("connection refused"), { code: "ECONNREFUSED" });
    vi.mocked(getDb).mockReturnValue(createFailingDb(databaseError));

    await expect(SubjectService.getSubjectById("1")).rejects.toBe(databaseError);
  });

  it("does not return a seeded academic year after a MySQL failure", async () => {
    const databaseError = Object.assign(new Error("connection refused"), { code: "ECONNREFUSED" });
    vi.mocked(getDb).mockReturnValue(createFailingDb(databaseError));

    await expect(AcademicService.getAcademicYearById("1")).rejects.toBe(databaseError);
  });

  it("does not return a seeded backup after a MySQL failure", async () => {
    const databaseError = Object.assign(new Error("connection refused"), { code: "ECONNREFUSED" });
    vi.mocked(getDb).mockReturnValue(createFailingDb(databaseError));

    await expect(BackupService.getBackupById("1")).rejects.toBe(databaseError);
  });
});

function createFailingDb(error: Error): Knex {
  const query = new Proxy({}, {
    get: (_target, property) => {
      if (property === "then") {
        return (resolve?: (value: never) => unknown, reject?: (reason: unknown) => unknown) =>
          Promise.reject(error).then(resolve, reject);
      }
      return () => query;
    }
  });
  return (() => query) as unknown as Knex;
}
