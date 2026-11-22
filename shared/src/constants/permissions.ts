export const SYSTEM_PERMISSIONS = [
  // User Management
  "users:read",
  "users:write",
  "users:delete",
  "users:status",
  // Academic
  "departments:manage",
  "courses:manage",
  "subjects:manage",
  "classes:manage",
  // Student
  "students:read",
  "students:write",
  "attendance:mark",
  "attendance:read",
  "marks:manage",
  "marks:read",
  // Finance
  "fees:manage",
  "payments:record",
  // System
  "settings:manage",
  "audit:read",
  "backup:manage"
] as const;

export type SystemPermission = typeof SYSTEM_PERMISSIONS[number];
