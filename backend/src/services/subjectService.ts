import {
  SubjectDto,
  CreateSubjectInput,
  UpdateSubjectInput,
  QuerySubjectsInput,
  MapSubjectToCourseInput,
  CourseSubjectMappingDto,
  UserDto,
  SubjectType
} from "@campuscore/shared";
import { getDb } from "../db/connection.js";
import { AuditService } from "./auditService.js";

export interface SubjectRow {
  id: number;
  code: string;
  name: string;
  department_id: number;
  type: string;
  credits: number;
  theory_credits: number;
  practical_credits: number;
  is_elective: number | boolean;
  is_active: number | boolean;
  description: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface CourseSubjectRow {
  id: number;
  course_id: number;
  subject_id: number;
  semester_number: number;
  is_mandatory: number | boolean;
  created_at: string | Date;
}

interface SubjectQueryRow extends SubjectRow {
  department_name?: string;
  department_code?: string;
}

function mapSubjectRowToDto(r: SubjectQueryRow, courses: CourseSubjectMappingDto[] = []): SubjectDto {
  return {
    id: String(r.id),
    code: r.code,
    name: r.name,
    departmentId: String(r.department_id),
    departmentName: r.department_name ?? undefined,
    departmentCode: r.department_code ?? undefined,
    type: r.type as SubjectType,
    credits: Number(r.credits),
    theoryCredits: Number(r.theory_credits),
    practicalCredits: Number(r.practical_credits),
    isElective: Boolean(r.is_elective),
    isActive: Boolean(r.is_active),
    description: r.description ?? null,
    courses,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString()
  };
}

export class SubjectService {
  static async listSubjects(
    query: QuerySubjectsInput
  ): Promise<{ subjects: SubjectDto[]; total: number }> {
    const { page = 1, pageSize = 20, departmentId, courseId, type, isElective, status = "all", q } = query;

    const db = getDb();
    let dbQuery = db("subjects as s")
        .leftJoin("departments as d", "s.department_id", "d.id")
        .select("s.*", "d.name as department_name", "d.code as department_code");

    if (departmentId) dbQuery = dbQuery.where("s.department_id", departmentId);
    if (type) dbQuery = dbQuery.where("s.type", type);
    if (isElective !== undefined) dbQuery = dbQuery.where("s.is_elective", isElective);
    if (status === "active") dbQuery = dbQuery.where("s.is_active", true);
    else if (status === "inactive") dbQuery = dbQuery.where("s.is_active", false);

    if (courseId) {
      dbQuery = dbQuery.whereExists(function () {
        this.select("*")
          .from("course_subjects as cs")
          .whereRaw("cs.subject_id = s.id")
          .andWhere("cs.course_id", courseId);
      });
    }

    if (q) {
      dbQuery = dbQuery.where((b) => {
        b.where("s.code", "like", `%${q}%`)
          .orWhere("s.name", "like", `%${q}%`)
          .orWhere("s.description", "like", `%${q}%`);
      });
    }

    const totalResult = await dbQuery.clone().clearSelect().count<{ count: number }>("s.id as count").first();
    const total = Number(totalResult?.count || 0);
    const rows = await dbQuery
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .orderBy("s.id", "asc");

    return {
      subjects: rows.map((r) => mapSubjectRowToDto(r)),
      total
    };
  }

  static async getSubjectById(id: string): Promise<SubjectDto | null> {
    const db = getDb();
    const row = await db("subjects as s")
        .leftJoin("departments as d", "s.department_id", "d.id")
        .where("s.id", id)
        .select("s.*", "d.name as department_name", "d.code as department_code")
        .first();

    if (row) {
      const mappings = await db("course_subjects as cs")
          .leftJoin("courses as c", "cs.course_id", "c.id")
          .where("cs.subject_id", id)
          .select(
            "cs.id",
            "cs.course_id",
            "c.name as course_name",
            "c.code as course_code",
            "cs.subject_id",
            "cs.semester_number",
            "cs.is_mandatory",
            "cs.created_at"
          );

      const courseDtos: CourseSubjectMappingDto[] = mappings.map((m) => ({
          id: String(m.id),
          courseId: String(m.course_id),
          courseName: m.course_name,
          courseCode: m.course_code,
          subjectId: String(m.subject_id),
          semesterNumber: Number(m.semester_number),
          isMandatory: Boolean(m.is_mandatory),
          createdAt: new Date(m.created_at).toISOString()
      }));

      return mapSubjectRowToDto(row, courseDtos);
    }
    return null;
  }

  static async createSubject(
    input: CreateSubjectInput,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ subject?: SubjectDto; error?: string }> {
    const code = input.code.trim().toUpperCase();

    const db = getDb();
    const existing = await db("subjects").where({ code }).first();
    if (existing) return { error: "DUPLICATE_CODE" };

    const dept = await db("departments").where({ id: input.departmentId }).first();
    if (!dept) return { error: "DEPARTMENT_NOT_FOUND" };

    const [insertId] = await db("subjects").insert({
        code,
        name: input.name.trim(),
        department_id: Number(input.departmentId),
        type: input.type ?? "THEORY",
        credits: input.credits ?? 3,
        theory_credits: input.theoryCredits ?? 3,
        practical_credits: input.practicalCredits ?? 0,
        is_elective: input.isElective ?? false,
        is_active: input.isActive ?? true,
        description: input.description ?? null
    });

    const subject = await this.getSubjectById(String(insertId));
    if (!subject) throw new Error("Subject insert was not readable after creation");

    await AuditService.log({
        userId: actor?.user.id,
        userEmail: actor?.user.email,
        role: actor?.user.role,
        action: "SUBJECT_CREATE",
        entity: "SUBJECT",
        entityId: String(insertId),
        details: { code, name: input.name },
        ipAddress: actor?.ip,
        userAgent: actor?.userAgent,
        status: "SUCCESS"
    });

    return { subject };
  }

  static async updateSubject(
    id: string,
    input: UpdateSubjectInput,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ subject?: SubjectDto; error?: string }> {
    const existing = await this.getSubjectById(id);
    if (!existing) return { error: "NOT_FOUND" };

    const updates: Record<string, unknown> = {
      updated_at: new Date()
    };

    if (input.name !== undefined) updates.name = input.name.trim();
    if (input.departmentId !== undefined) updates.department_id = Number(input.departmentId);
    if (input.type !== undefined) updates.type = input.type;
    if (input.credits !== undefined) updates.credits = input.credits;
    if (input.theoryCredits !== undefined) updates.theory_credits = input.theoryCredits;
    if (input.practicalCredits !== undefined) updates.practical_credits = input.practicalCredits;
    if (input.isElective !== undefined) updates.is_elective = input.isElective ? 1 : 0;
    if (input.isActive !== undefined) updates.is_active = input.isActive ? 1 : 0;
    if (input.description !== undefined) updates.description = input.description;

    const db = getDb();
    await db("subjects").where({ id }).update(updates);
    const updated = await this.getSubjectById(id);
    if (!updated) return { error: "NOT_FOUND" };

    await AuditService.log({
        userId: actor?.user.id,
        userEmail: actor?.user.email,
        role: actor?.user.role,
        action: "SUBJECT_UPDATE",
        entity: "SUBJECT",
        entityId: id,
        details: { changes: input },
        ipAddress: actor?.ip,
        userAgent: actor?.userAgent,
        status: "SUCCESS"
    });

    return { subject: updated };
  }

  static async toggleSubjectStatus(
    id: string,
    isActive: boolean,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ subject?: SubjectDto; error?: string }> {
    return this.updateSubject(id, { isActive }, actor);
  }

  static async mapSubjectToCourse(
    subjectId: string,
    input: MapSubjectToCourseInput,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ mapping?: CourseSubjectMappingDto; error?: string }> {
    const subject = await this.getSubjectById(subjectId);
    if (!subject) return { error: "SUBJECT_NOT_FOUND" };

    const db = getDb();
    const course = await db("courses").where({ id: input.courseId }).first();
    if (!course) return { error: "COURSE_NOT_FOUND" };

    const existing = await db("course_subjects")
      .where({
        course_id: input.courseId,
        subject_id: subjectId,
        semester_number: input.semesterNumber
      })
      .first();

    if (existing) return { error: "ALREADY_MAPPED" };

    const [insertId] = await db("course_subjects").insert({
      course_id: Number(input.courseId),
      subject_id: Number(subjectId),
      semester_number: input.semesterNumber,
      is_mandatory: input.isMandatory !== false
    });

    await AuditService.log({
        userId: actor?.user.id,
        userEmail: actor?.user.email,
        role: actor?.user.role,
        action: "COURSE_SUBJECT_MAP",
        entity: "COURSE_SUBJECT",
        entityId: String(insertId),
        details: { courseId: input.courseId, subjectId, semester: input.semesterNumber },
        ipAddress: actor?.ip,
        userAgent: actor?.userAgent,
        status: "SUCCESS"
    });

    return {
      mapping: {
        id: String(insertId),
        courseId: input.courseId,
        courseName: course.name,
        courseCode: course.code,
        subjectId,
        semesterNumber: input.semesterNumber,
        isMandatory: input.isMandatory !== false,
        createdAt: new Date().toISOString()
      }
    };
  }

  static async unmapSubjectFromCourse(
    subjectId: string,
    courseId: string,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ success: boolean; error?: string }> {
    const db = getDb();
    await db("course_subjects")
      .where({ subject_id: subjectId, course_id: courseId })
      .del();

    await AuditService.log({
        userId: actor?.user.id,
        userEmail: actor?.user.email,
        role: actor?.user.role,
        action: "COURSE_SUBJECT_UNMAP",
        entity: "COURSE_SUBJECT",
        entityId: `${courseId}-${subjectId}`,
        details: { courseId, subjectId },
        ipAddress: actor?.ip,
        userAgent: actor?.userAgent,
        status: "SUCCESS"
    });

    return { success: true };
  }

  static async getSubjectsForCourse(courseId: string): Promise<SubjectDto[]> {
    const db = getDb();
    const rows = await db("course_subjects as cs")
        .join("subjects as s", "cs.subject_id", "s.id")
        .leftJoin("departments as d", "s.department_id", "d.id")
        .where("cs.course_id", courseId)
        .select("s.*", "d.name as department_name", "d.code as department_code")
        .orderBy("cs.semester_number", "asc")
        .orderBy("s.code", "asc");

    return rows.map((r) => mapSubjectRowToDto(r));
  }
}
