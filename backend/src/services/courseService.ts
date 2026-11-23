import {
  CourseDto,
  CreateCourseInput,
  UpdateCourseInput,
  QueryCoursesInput,
  UserDto
} from "@campuscore/shared";
import { getDb } from "../db/connection.js";
import { DepartmentService } from "./departmentService.js";
import { AuditService } from "./auditService.js";

export interface CourseRow {
  id: number;
  department_id: number;
  code: string;
  name: string;
  description: string | null;
  degree_level: CourseDto["degreeLevel"];
  duration_years: number;
  total_credits: number;
  is_active: number | boolean;
  created_at: string | Date;
  updated_at: string | Date;
}

export class CourseService {
  static async createCourse(
    input: CreateCourseInput,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ course?: CourseDto; error?: string }> {
    const code = input.code.trim().toUpperCase();

    // 1. Verify department exists
    const dept = await DepartmentService.getDepartmentById(input.departmentId);
    if (!dept) {
      return { error: "DEPARTMENT_NOT_FOUND" };
    }

    // 2. Check code uniqueness
    const db = getDb();
    const existing = await db("courses").where({ code }).first();
    if (existing) {
      return { error: "DUPLICATE_CODE" };
    }

    const [insertId] = await db("courses").insert({
      department_id: Number(input.departmentId),
      code,
      name: input.name.trim(),
      description: input.description ?? null,
      degree_level: input.degreeLevel,
      duration_years: input.durationYears,
      total_credits: input.totalCredits,
      is_active: true
    });

    const row = await db("courses").where({ id: insertId }).first();
    const course: CourseDto = {
      id: String(row.id),
      departmentId: String(row.department_id),
      departmentCode: dept.code,
      departmentName: dept.name,
      code: row.code,
      name: row.name,
      description: row.description,
      degreeLevel: row.degree_level,
      durationYears: Number(row.duration_years),
      totalCredits: Number(row.total_credits),
      isActive: Boolean(row.is_active),
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
      stats: { studentCount: 0, teacherCount: 0, subjectCount: 0 }
    };

    await AuditService.log({
      userId: actor?.user.id,
      userEmail: actor?.user.email,
      role: actor?.user.role,
      action: "COURSE_CREATE",
      entity: "COURSE",
      entityId: course.id,
      details: { code: course.code, name: course.name, departmentId: course.departmentId },
      ipAddress: actor?.ip,
      userAgent: actor?.userAgent,
      status: "SUCCESS"
    });

    return { course };
  }

  static async listCourses(
    query: QueryCoursesInput
  ): Promise<{ courses: CourseDto[]; total: number }> {
    const { page, pageSize, departmentId, degreeLevel, status, q } = query;

    const db = getDb();
    let dbQuery = db("courses")
        .leftJoin("departments", "courses.department_id", "departments.id")
        .select(
          "courses.*",
          "departments.name as department_name",
          "departments.code as department_code"
        );

    if (departmentId) dbQuery = dbQuery.where("courses.department_id", Number(departmentId));
    if (degreeLevel) dbQuery = dbQuery.where("courses.degree_level", degreeLevel);
    if (status === "active") dbQuery = dbQuery.where("courses.is_active", true);
    else if (status === "inactive") dbQuery = dbQuery.where("courses.is_active", false);

    if (q) {
      dbQuery = dbQuery.where((b) => {
        b.where("courses.code", "like", `%${q}%`)
          .orWhere("courses.name", "like", `%${q}%`)
          .orWhere("departments.name", "like", `%${q}%`);
      });
    }

    const totalResult = await dbQuery.clone().clearSelect().count<{ count: number }>("courses.id as count").first();
    const total = Number(totalResult?.count || 0);
    const rows = await dbQuery
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .orderBy("courses.id", "asc");

    const courses: CourseDto[] = rows.map((r) => ({
        id: String(r.id),
        departmentId: String(r.department_id),
        departmentName: r.department_name,
        departmentCode: r.department_code,
        code: r.code,
        name: r.name,
        description: r.description,
        degreeLevel: r.degree_level,
        durationYears: Number(r.duration_years),
        totalCredits: Number(r.total_credits),
        isActive: Boolean(r.is_active),
        createdAt: new Date(r.created_at).toISOString(),
        updatedAt: new Date(r.updated_at).toISOString(),
        stats: { studentCount: 0, teacherCount: 0, subjectCount: 0 }
    }));

    return { courses, total };
  }

  static async getCourseById(id: string): Promise<CourseDto | null> {
    const db = getDb();
    const row = await db("courses")
        .leftJoin("departments", "courses.department_id", "departments.id")
        .select(
          "courses.*",
          "departments.name as department_name",
          "departments.code as department_code"
        )
        .where("courses.id", id)
        .first();

    if (row) {
      return {
          id: String(row.id),
          departmentId: String(row.department_id),
          departmentName: row.department_name,
          departmentCode: row.department_code,
          code: row.code,
          name: row.name,
          description: row.description,
          degreeLevel: row.degree_level,
          durationYears: Number(row.duration_years),
          totalCredits: Number(row.total_credits),
          isActive: Boolean(row.is_active),
          createdAt: new Date(row.created_at).toISOString(),
          updatedAt: new Date(row.updated_at).toISOString(),
          stats: { studentCount: 0, teacherCount: 0, subjectCount: 0 }
      }
    }
    return null;
  }

  static async updateCourse(
    id: string,
    input: UpdateCourseInput,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ course?: CourseDto; error?: string }> {
    const existing = await this.getCourseById(id);
    if (!existing) return { error: "NOT_FOUND" };

    if (input.departmentId) {
      const dept = await DepartmentService.getDepartmentById(input.departmentId);
      if (!dept) return { error: "DEPARTMENT_NOT_FOUND" };
    }

    const updates: Partial<CourseRow> = {
      updated_at: new Date()
    };
    if (input.departmentId !== undefined) updates.department_id = Number(input.departmentId);
    if (input.name !== undefined) updates.name = input.name.trim();
    if (input.description !== undefined) updates.description = input.description;
    if (input.degreeLevel !== undefined) updates.degree_level = input.degreeLevel;
    if (input.durationYears !== undefined) updates.duration_years = input.durationYears;
    if (input.totalCredits !== undefined) updates.total_credits = input.totalCredits;
    if (input.isActive !== undefined) updates.is_active = input.isActive ? 1 : 0;

    const db = getDb();
    await db("courses").where({ id }).update(updates);
    const updated = await this.getCourseById(id);

    await AuditService.log({
        userId: actor?.user.id,
        userEmail: actor?.user.email,
        role: actor?.user.role,
        action: "COURSE_UPDATE",
        entity: "COURSE",
        entityId: id,
        details: { changes: input },
        ipAddress: actor?.ip,
        userAgent: actor?.userAgent,
        status: "SUCCESS"
    });

    if (!updated) return { error: "NOT_FOUND" };
    return { course: updated };
  }

  static async toggleCourseStatus(
    id: string,
    isActive: boolean,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ course?: CourseDto; error?: string }> {
    return this.updateCourse(id, { isActive }, actor);
  }
}
