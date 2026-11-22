import {
  DepartmentDto,
  CreateDepartmentInput,
  UpdateDepartmentInput,
  QueryDepartmentsInput,
  UserDto
} from "@campuscore/shared";
import { getDb } from "../db/connection.js";
import { AuditService } from "./auditService.js";

export interface DepartmentRow {
  id: number;
  code: string;
  name: string;
  description: string | null;
  head_of_department: string | null;
  is_active: number | boolean;
  created_at: string | Date;
  updated_at: string | Date;
}

export const inMemoryDepartments: DepartmentRow[] = [
  {
    id: 1,
    code: "CSE",
    name: "Computer Science & Engineering",
    description: "Department of Computer Science and Engineering",
    head_of_department: "Dr. Alan Turing",
    is_active: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    code: "ECE",
    name: "Electronics & Communication Engineering",
    description: "Department of Electronics and Communication",
    head_of_department: "Dr. Claude Shannon",
    is_active: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let nextDeptId = 3;

export class DepartmentService {
  static async createDepartment(
    input: CreateDepartmentInput,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ department?: DepartmentDto; error?: string }> {
    const code = input.code.trim().toUpperCase();

    // 1. Check uniqueness (DB or Memory)
    try {
      const db = getDb();
      const existing = await db("departments").where({ code }).first();
      if (existing) {
        return { error: "DUPLICATE_CODE" };
      }

      const [insertId] = await db("departments").insert({
        code,
        name: input.name.trim(),
        description: input.description ?? null,
        head_of_department: input.headOfDepartment ?? null,
        is_active: true
      });

      const row = await db("departments").where({ id: insertId }).first();
      const department: DepartmentDto = {
        id: String(row.id),
        code: row.code,
        name: row.name,
        description: row.description,
        headOfDepartment: row.head_of_department,
        isActive: Boolean(row.is_active),
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString(),
        stats: { courseCount: 0, facultyCount: 0, studentCount: 0 }
      };

      await AuditService.log({
        userId: actor?.user.id,
        userEmail: actor?.user.email,
        role: actor?.user.role,
        action: "DEPARTMENT_CREATE",
        entity: "DEPARTMENT",
        entityId: department.id,
        details: { code: department.code, name: department.name },
        ipAddress: actor?.ip,
        userAgent: actor?.userAgent,
        status: "SUCCESS"
      });

      return { department };
    } catch {
      // Memory fallback
    }

    if (inMemoryDepartments.some((d) => d.code === code)) {
      return { error: "DUPLICATE_CODE" };
    }

    const now = new Date().toISOString();
    const newDept: DepartmentRow = {
      id: nextDeptId++,
      code,
      name: input.name.trim(),
      description: input.description ?? null,
      head_of_department: input.headOfDepartment ?? null,
      is_active: 1,
      created_at: now,
      updated_at: now
    };

    inMemoryDepartments.push(newDept);

    const department: DepartmentDto = {
      id: String(newDept.id),
      code: newDept.code,
      name: newDept.name,
      description: newDept.description,
      headOfDepartment: newDept.head_of_department,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      stats: { courseCount: 0, facultyCount: 0, studentCount: 0 }
    };

    await AuditService.log({
      userId: actor?.user.id,
      userEmail: actor?.user.email,
      role: actor?.user.role,
      action: "DEPARTMENT_CREATE",
      entity: "DEPARTMENT",
      entityId: department.id,
      details: { code: department.code, name: department.name },
      ipAddress: actor?.ip,
      userAgent: actor?.userAgent,
      status: "SUCCESS"
    });

    return { department };
  }

  static async listDepartments(
    query: QueryDepartmentsInput
  ): Promise<{ departments: DepartmentDto[]; total: number }> {
    const { page, pageSize, q, status } = query;

    // 1. Try DB
    try {
      const db = getDb();
      let dbQuery = db("departments");

      if (status === "active") dbQuery = dbQuery.where("is_active", true);
      else if (status === "inactive") dbQuery = dbQuery.where("is_active", false);

      if (q) {
        dbQuery = dbQuery.where((b) => {
          b.where("code", "like", `%${q}%`)
            .orWhere("name", "like", `%${q}%`)
            .orWhere("head_of_department", "like", `%${q}%`);
        });
      }

      const totalResult = await dbQuery.clone().count<{ count: number }>("id as count").first();
      const total = Number(totalResult?.count || 0);
      const rows = await dbQuery
        .offset((page - 1) * pageSize)
        .limit(pageSize)
        .orderBy("id", "asc");

      const departments: DepartmentDto[] = rows.map((r) => ({
        id: String(r.id),
        code: r.code,
        name: r.name,
        description: r.description,
        headOfDepartment: r.head_of_department,
        isActive: Boolean(r.is_active),
        createdAt: new Date(r.created_at).toISOString(),
        updatedAt: new Date(r.updated_at).toISOString(),
        stats: { courseCount: 0, facultyCount: 0, studentCount: 0 }
      }));

      return { departments, total };
    } catch {
      // Memory fallback
    }

    let filtered = [...inMemoryDepartments];
    if (status === "active") filtered = filtered.filter((d) => Boolean(d.is_active));
    else if (status === "inactive") filtered = filtered.filter((d) => !Boolean(d.is_active));

    if (q) {
      const qLower = q.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.code.toLowerCase().includes(qLower) ||
          d.name.toLowerCase().includes(qLower) ||
          (d.head_of_department && d.head_of_department.toLowerCase().includes(qLower))
      );
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    return {
      departments: paginated.map((r) => ({
        id: String(r.id),
        code: r.code,
        name: r.name,
        description: r.description,
        headOfDepartment: r.head_of_department,
        isActive: Boolean(r.is_active),
        createdAt: new Date(r.created_at).toISOString(),
        updatedAt: new Date(r.updated_at).toISOString(),
        stats: { courseCount: 0, facultyCount: 0, studentCount: 0 }
      })),
      total
    };
  }

  static async getDepartmentById(id: string): Promise<DepartmentDto | null> {
    try {
      const db = getDb();
      const row = await db("departments").where({ id }).first();
      if (row) {
        return {
          id: String(row.id),
          code: row.code,
          name: row.name,
          description: row.description,
          headOfDepartment: row.head_of_department,
          isActive: Boolean(row.is_active),
          createdAt: new Date(row.created_at).toISOString(),
          updatedAt: new Date(row.updated_at).toISOString(),
          stats: { courseCount: 0, facultyCount: 0, studentCount: 0 }
        };
      }
    } catch {
      // Memory fallback
    }

    const row = inMemoryDepartments.find((d) => String(d.id) === id);
    if (!row) return null;

    return {
      id: String(row.id),
      code: row.code,
      name: row.name,
      description: row.description,
      headOfDepartment: row.head_of_department,
      isActive: Boolean(row.is_active),
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
      stats: { courseCount: 0, facultyCount: 0, studentCount: 0 }
    };
  }

  static async updateDepartment(
    id: string,
    input: UpdateDepartmentInput,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ department?: DepartmentDto; error?: string }> {
    const existing = await this.getDepartmentById(id);
    if (!existing) return { error: "NOT_FOUND" };

    const updates: Partial<DepartmentRow> = {
      updated_at: new Date().toISOString()
    };
    if (input.name !== undefined) updates.name = input.name.trim();
    if (input.description !== undefined) updates.description = input.description;
    if (input.headOfDepartment !== undefined) updates.head_of_department = input.headOfDepartment;
    if (input.isActive !== undefined) updates.is_active = input.isActive ? 1 : 0;

    try {
      const db = getDb();
      await db("departments").where({ id }).update(updates);
      const updated = await this.getDepartmentById(id);

      await AuditService.log({
        userId: actor?.user.id,
        userEmail: actor?.user.email,
        role: actor?.user.role,
        action: "DEPARTMENT_UPDATE",
        entity: "DEPARTMENT",
        entityId: id,
        details: { changes: input },
        ipAddress: actor?.ip,
        userAgent: actor?.userAgent,
        status: "SUCCESS"
      });

      return { department: updated! };
    } catch {
      // Memory fallback
    }

    const idx = inMemoryDepartments.findIndex((d) => String(d.id) === id);
    if (idx !== -1) {
      inMemoryDepartments[idx] = {
        ...inMemoryDepartments[idx],
        ...updates
      };
    }

    const updated = await this.getDepartmentById(id);

    await AuditService.log({
      userId: actor?.user.id,
      userEmail: actor?.user.email,
      role: actor?.user.role,
      action: "DEPARTMENT_UPDATE",
      entity: "DEPARTMENT",
      entityId: id,
      details: { changes: input },
      ipAddress: actor?.ip,
      userAgent: actor?.userAgent,
      status: "SUCCESS"
    });

    return { department: updated! };
  }

  static async toggleDepartmentStatus(
    id: string,
    isActive: boolean,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ department?: DepartmentDto; error?: string }> {
    return this.updateDepartment(id, { isActive }, actor);
  }
}
