import { SYSTEM_ROLES, SYSTEM_PERMISSIONS } from "@campuscore/shared";

export interface RoleDescriptor {
  name: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
}

export class RoleService {
  static listRoles(): RoleDescriptor[] {
    return [
      {
        name: "SUPER_ADMIN",
        description: "Institution owner / IT lead with unrestricted system privileges",
        isSystem: true,
        permissions: [...SYSTEM_PERMISSIONS]
      },
      {
        name: "ADMIN",
        description: "Registrar and academic operations officer",
        isSystem: true,
        permissions: SYSTEM_PERMISSIONS.filter((p) => !p.startsWith("backup:"))
      },
      {
        name: "TEACHER",
        description: "Faculty member managing assigned classes, subjects, attendance, and marks",
        isSystem: true,
        permissions: ["students:read", "attendance:mark", "attendance:read", "marks:manage", "marks:read"]
      },
      {
        name: "STAFF",
        description: "Operational staff for front-office, fees, transport, or hostel",
        isSystem: true,
        permissions: ["students:read", "fees:manage", "payments:record"]
      },
      {
        name: "STUDENT",
        description: "Enrolled student with self-service view of own records",
        isSystem: true,
        permissions: ["students:read", "attendance:read", "marks:read"]
      },
      {
        name: "PARENT",
        description: "Guardian with read-only view of linked children's records",
        isSystem: true,
        permissions: ["students:read", "attendance:read", "marks:read"]
      }
    ];
  }

  static listPermissions(): string[] {
    return [...SYSTEM_PERMISSIONS];
  }
}
