import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SYSTEM_ROLES, type SystemRole } from "@campuscore/shared";

const mocks = vi.hoisted(() => {
  const defaultResult = (method: string): unknown => {
    if (method === "listRoles" || method === "listPermissions") return [];
    if (method.startsWith("list")) {
      const collection = method.slice(4);
      const key = collection.charAt(0).toLowerCase() + collection.slice(1);
      return { [key]: [], total: 0 };
    }
    if (method.startsWith("get")) return null;
    if (method.startsWith("create") || method.startsWith("update") || method.startsWith("toggle")) {
      return { error: "NOT_FOUND", success: false };
    }
    if (method.startsWith("delete")) return { success: false };
    return undefined;
  };

  const makeService = () => {
    const methods = new Map<string, ReturnType<typeof vi.fn>>();
    return new Proxy({}, {
      get: (_target, property) => {
        if (typeof property !== "string" || property === "then") return undefined;
        let method = methods.get(property);
        if (!method) {
          method = vi.fn(async () => defaultResult(property));
          methods.set(property, method);
        }
        return method;
      }
    });
  };

  return { validateSession: vi.fn(), makeService };
});

vi.mock("../../src/db/connection.js", () => ({
  getDb: vi.fn(),
  checkDatabaseHealth: vi.fn(async () => true)
}));
vi.mock("../../src/services/authService.js", () => ({
  AuthService: new Proxy({}, {
    get: (_target, property) => property === "validateSession" ? mocks.validateSession : vi.fn(async () => undefined)
  })
}));
vi.mock("../../src/services/userService.js", () => ({ UserService: mocks.makeService() }));
vi.mock("../../src/services/roleService.js", () => ({ RoleService: mocks.makeService() }));
vi.mock("../../src/services/departmentService.js", () => ({ DepartmentService: mocks.makeService() }));
vi.mock("../../src/services/academicService.js", () => ({ AcademicService: mocks.makeService() }));
vi.mock("../../src/services/auditService.js", () => ({ AuditService: mocks.makeService() }));
vi.mock("../../src/services/courseService.js", () => ({ CourseService: mocks.makeService() }));
vi.mock("../../src/services/settingsService.js", () => ({ SettingsService: mocks.makeService() }));
vi.mock("../../src/services/studentService.js", () => ({ StudentService: mocks.makeService() }));
vi.mock("../../src/services/subjectService.js", () => ({ SubjectService: mocks.makeService() }));
vi.mock("../../src/services/backupService.js", () => ({ BackupService: mocks.makeService() }));

import { createApp } from "../../src/app.js";

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";
type Actor = SystemRole | null;
type RoutePolicy = "public" | "authenticated" | "student-read" | "user-self";

interface RouteCase {
  method: HttpMethod;
  path: string | ((actor: Actor) => string);
  policy: RoutePolicy;
  allowedRoles?: readonly SystemRole[];
  body?: unknown;
}

const admins = ["SUPER_ADMIN", "ADMIN"] as const satisfies readonly SystemRole[];
const superAdmin = ["SUPER_ADMIN"] as const satisfies readonly SystemRole[];

const routes: RouteCase[] = [
  { method: "get", path: "/health", policy: "public" },
  { method: "get", path: "/api/v1/health", policy: "public" },
  { method: "get", path: "/api/v1/modules", policy: "public" },
  { method: "get", path: "/api/v1/modules/not-a-module", policy: "public" },
  { method: "post", path: "/api/v1/auth/login", policy: "public", body: {} },
  { method: "post", path: "/api/v1/auth/logout", policy: "authenticated" },
  { method: "get", path: "/api/v1/auth/me", policy: "authenticated" },

  { method: "get", path: "/api/v1/users", policy: "authenticated", allowedRoles: admins },
  { method: "post", path: "/api/v1/users", policy: "authenticated", allowedRoles: admins, body: {} },
  {
    method: "get",
    path: (actor) => actor ? `/api/v1/users/self-${actor}` : "/api/v1/users/not-self",
    policy: "user-self"
  },
  { method: "get", path: "/api/v1/users/not-self", policy: "authenticated", allowedRoles: admins },
  { method: "put", path: "/api/v1/users/55", policy: "authenticated", allowedRoles: admins, body: {} },
  { method: "patch", path: "/api/v1/users/55/status", policy: "authenticated", allowedRoles: superAdmin, body: {} },
  { method: "post", path: "/api/v1/users/55/reset-password", policy: "authenticated", allowedRoles: admins, body: {} },
  { method: "get", path: "/api/v1/roles", policy: "authenticated" },
  { method: "get", path: "/api/v1/permissions", policy: "authenticated" },

  { method: "get", path: "/api/v1/departments", policy: "authenticated" },
  { method: "post", path: "/api/v1/departments", policy: "authenticated", allowedRoles: admins, body: {} },
  { method: "get", path: "/api/v1/departments/1", policy: "authenticated" },
  { method: "put", path: "/api/v1/departments/1", policy: "authenticated", allowedRoles: admins, body: {} },
  { method: "patch", path: "/api/v1/departments/1/status", policy: "authenticated", allowedRoles: admins, body: {} },

  { method: "get", path: "/api/v1/academic-years", policy: "authenticated" },
  { method: "get", path: "/api/v1/academic-years/current", policy: "authenticated" },
  { method: "post", path: "/api/v1/academic-years", policy: "authenticated", allowedRoles: admins, body: {} },
  { method: "get", path: "/api/v1/academic-years/1", policy: "authenticated" },
  { method: "put", path: "/api/v1/academic-years/1", policy: "authenticated", allowedRoles: admins, body: {} },
  { method: "patch", path: "/api/v1/academic-years/1/set-current", policy: "authenticated", allowedRoles: admins, body: {} },
  { method: "get", path: "/api/v1/academic-years/1/semesters", policy: "authenticated" },
  { method: "post", path: "/api/v1/academic-years/1/semesters", policy: "authenticated", allowedRoles: admins, body: {} },
  { method: "get", path: "/api/v1/semesters/1", policy: "authenticated" },
  { method: "put", path: "/api/v1/semesters/1", policy: "authenticated", allowedRoles: admins, body: {} },
  { method: "patch", path: "/api/v1/semesters/1/activate", policy: "authenticated", allowedRoles: admins, body: {} },

  { method: "get", path: "/api/v1/audit-logs", policy: "authenticated", allowedRoles: admins },
  { method: "get", path: "/api/v1/audit-logs/1", policy: "authenticated", allowedRoles: admins },
  { method: "get", path: "/api/v1/courses", policy: "authenticated" },
  { method: "post", path: "/api/v1/courses", policy: "authenticated", allowedRoles: admins, body: {} },
  { method: "get", path: "/api/v1/courses/1", policy: "authenticated" },
  { method: "put", path: "/api/v1/courses/1", policy: "authenticated", allowedRoles: admins, body: {} },
  { method: "patch", path: "/api/v1/courses/1/status", policy: "authenticated", allowedRoles: admins, body: {} },

  { method: "get", path: "/api/v1/settings/public", policy: "public" },
  { method: "get", path: "/api/v1/settings", policy: "authenticated" },
  { method: "put", path: "/api/v1/settings", policy: "authenticated", allowedRoles: superAdmin, body: {} },

  { method: "get", path: "/api/v1/students", policy: "student-read" },
  { method: "post", path: "/api/v1/students", policy: "authenticated", allowedRoles: admins, body: {} },
  { method: "get", path: "/api/v1/students/44", policy: "student-read" },
  { method: "put", path: "/api/v1/students/44", policy: "authenticated", allowedRoles: admins, body: {} },
  { method: "patch", path: "/api/v1/students/44/status", policy: "authenticated", allowedRoles: admins, body: {} },
  { method: "delete", path: "/api/v1/students/44", policy: "authenticated", allowedRoles: superAdmin },

  { method: "get", path: "/api/v1/subjects", policy: "authenticated" },
  { method: "post", path: "/api/v1/subjects", policy: "authenticated", allowedRoles: admins, body: {} },
  { method: "get", path: "/api/v1/subjects/1", policy: "authenticated" },
  { method: "put", path: "/api/v1/subjects/1", policy: "authenticated", allowedRoles: admins, body: {} },
  { method: "patch", path: "/api/v1/subjects/1/status", policy: "authenticated", allowedRoles: admins, body: {} },
  { method: "post", path: "/api/v1/subjects/1/courses", policy: "authenticated", allowedRoles: admins, body: {} },
  { method: "delete", path: "/api/v1/subjects/1/courses/2", policy: "authenticated", allowedRoles: admins },

  { method: "get", path: "/api/v1/backups", policy: "authenticated", allowedRoles: admins },
  { method: "post", path: "/api/v1/backups", policy: "authenticated", allowedRoles: superAdmin, body: {} },
  { method: "get", path: "/api/v1/backups/1/verify", policy: "authenticated", allowedRoles: admins },
  { method: "post", path: "/api/v1/backups/1/restore", policy: "authenticated", allowedRoles: superAdmin, body: {} },
  { method: "delete", path: "/api/v1/backups/1", policy: "authenticated", allowedRoles: superAdmin }
];

const app = express();
app.use(express.json());
app.use(createApp());

describe("route authorization matrix", () => {
  beforeEach(() => {
    mocks.validateSession.mockImplementation(async (token: string) => {
      const role = token.replace("authorization-matrix:", "") as SystemRole;
      if (!SYSTEM_ROLES.includes(role)) return null;
      return {
        id: `self-${role}`,
        email: `${role.toLowerCase()}@example.test`,
        firstName: "Audit",
        lastName: "Actor",
        role,
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z"
      };
    });
  });

  it("matches the documented unauthenticated and six-role policy for every mounted route", async () => {
    let checks = 0;

    for (const route of routes) {
      for (const actor of [null, ...SYSTEM_ROLES] as Actor[]) {
        const path = typeof route.path === "function" ? route.path(actor) : route.path;
        let pending = makeRequest(route.method, path);
        if (actor) pending = pending.set("Authorization", `Bearer authorization-matrix:${actor}`);
        if (route.body !== undefined) pending = pending.send(route.body);

        const response = await pending;
        const context = `${route.method.toUpperCase()} ${path} as ${actor ?? "unauthenticated"}`;
        const code = response.body?.error?.code as string | undefined;

        if (!actor && route.policy !== "public") {
          expect(code, context).toBe("UNAUTHENTICATED");
        } else if (actor && route.policy === "student-read" && actor === "PARENT") {
          expect(response.status, context).toBe(403);
          expect(code, context).toBe("STUDENT_ACCESS_UNAVAILABLE");
        } else {
          const isAllowed = actor !== null && (
            route.policy === "public" ||
            route.policy === "student-read" ||
            route.policy === "user-self" ||
            !route.allowedRoles ||
            route.allowedRoles.includes(actor)
          );
          if (actor && !isAllowed && route.policy !== "public" && route.policy !== "user-self") {
            expect(response.status, context).toBe(403);
            expect(code, context).toBe("FORBIDDEN");
          } else {
            expect(["UNAUTHENTICATED", "INVALID_SESSION", "FORBIDDEN"], context).not.toContain(code);
          }
        }
        checks += 1;
      }
    }

    expect(routes).toHaveLength(60);
    expect(checks).toBe(420);
  }, 30000);
});

function makeRequest(method: HttpMethod, path: string) {
  switch (method) {
    case "get": return request(app).get(path);
    case "post": return request(app).post(path);
    case "put": return request(app).put(path);
    case "patch": return request(app).patch(path);
    case "delete": return request(app).delete(path);
  }
}
