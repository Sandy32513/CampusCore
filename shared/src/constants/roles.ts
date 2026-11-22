export const SYSTEM_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "TEACHER",
  "STAFF",
  "STUDENT",
  "PARENT"
] as const;

export type SystemRole = typeof SYSTEM_ROLES[number];
