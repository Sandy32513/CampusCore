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

export const inMemorySubjects: SubjectRow[] = [
  {
    id: 1,
    code: "CS101-TH",
    name: "Introduction to Computer Systems & Programming",
    department_id: 1,
    type: "THEORY",
    credits: 4,
    theory_credits: 3,
    practical_credits: 1,
    is_elective: 0,
    is_active: 1,
    description: "Fundamental principles of computing and structured programming.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    code: "CS102-DS",
    name: "Data Structures & Algorithm Design",
    department_id: 1,
    type: "THEORY",
    credits: 4,
    theory_credits: 3,
    practical_credits: 1,
    is_elective: 0,
    is_active: 1,
    description: "Linear and non-linear data structures, trees, graphs, and complexity.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    code: "CS103-LB",
    name: "Computing & Software Development Laboratory",
    department_id: 1,
    type: "PRACTICAL",
    credits: 2,
    theory_credits: 0,
    practical_credits: 2,
    is_elective: 0,
    is_active: 1,
    description: "Hands-on implementation of algorithms in C/C++ and modern systems.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const inMemoryCourseSubjects: CourseSubjectRow[] = [
  {
    id: 1,
    course_id: 1,
    subject_id: 1,
    semester_number: 1,
    is_mandatory: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    course_id: 1,
    subject_id: 3,
    semester_number: 1,
    is_mandatory: 1,
    created_at: new Date().toISOString()
  }
];

let nextSubjectId = 4;
let nextMappingId = 3;

function mapSubjectRowToDto(r: any, courses: CourseSubjectMappingDto[] = []): SubjectDto {
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

    // 1. Try DB
    try {
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

      const subjects: SubjectDto[] = rows.map((r) => mapSubjectRowToDto(r));
      return { subjects, total };
    } catch {
      // Memory fallback
    }

    let filtered = [...inMemorySubjects];
    if (departmentId) filtered = filtered.filter((s) => String(s.department_id) === departmentId);
    if (type) filtered = filtered.filter((s) => s.type === type);
    if (isElective !== undefined) filtered = filtered.filter((s) => Boolean(s.is_elective) === isElective);
    if (status === "active") filtered = filtered.filter((s) => Boolean(s.is_active));
    else if (status === "inactive") filtered = filtered.filter((s) => !Boolean(s.is_active));

    if (courseId) {
      const validSubIds = inMemoryCourseSubjects
        .filter((cs) => String(cs.course_id) === courseId)
        .map((cs) => cs.subject_id);
      filtered = filtered.filter((s) => validSubIds.includes(s.id));
    }

    if (q) {
      const qLower = q.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.code.toLowerCase().includes(qLower) ||
          s.name.toLowerCase().includes(qLower) ||
          (s.description && s.description.toLowerCase().includes(qLower))
      );
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    return {
      subjects: paginated.map((r) => mapSubjectRowToDto(r)),
      total
    };
  }

  static async getSubjectById(id: string): Promise<SubjectDto | null> {
    try {
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
    } catch {
      // Memory fallback
    }

    const row = inMemorySubjects.find((s) => String(s.id) === id);
    if (!row) return null;

    const mappings = inMemoryCourseSubjects
      .filter((cs) => String(cs.subject_id) === id)
      .map((cs) => ({
        id: String(cs.id),
        courseId: String(cs.course_id),
        subjectId: String(cs.subject_id),
        semesterNumber: cs.semester_number,
        isMandatory: Boolean(cs.is_mandatory),
        createdAt: new Date(cs.created_at).toISOString()
      }));

    return mapSubjectRowToDto(row, mappings);
  }

  static async createSubject(
    input: CreateSubjectInput,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ subject?: SubjectDto; error?: string }> {
    const code = input.code.trim().toUpperCase();

    try {
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

      return { subject: subject! };
    } catch {
      // Memory fallback
    }

    if (inMemorySubjects.some((s) => s.code === code)) return { error: "DUPLICATE_CODE" };

    const newRow: SubjectRow = {
      id: nextSubjectId++,
      code,
      name: input.name.trim(),
      department_id: Number(input.departmentId),
      type: input.type ?? "THEORY",
      credits: input.credits ?? 3,
      theory_credits: input.theoryCredits ?? 3,
      practical_credits: input.practicalCredits ?? 0,
      is_elective: input.isElective ? 1 : 0,
      is_active: input.isActive !== false ? 1 : 0,
      description: input.description ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    inMemorySubjects.push(newRow);
    const subject = mapSubjectRowToDto(newRow);

    await AuditService.log({
      userId: actor?.user.id,
      userEmail: actor?.user.email,
      role: actor?.user.role,
      action: "SUBJECT_CREATE",
      entity: "SUBJECT",
      entityId: subject.id,
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

    const updates: any = {
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

    try {
      const db = getDb();
      await db("subjects").where({ id }).update(updates);
      const updated = await this.getSubjectById(id);

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

      return { subject: updated! };
    } catch {
      // Memory fallback
    }

    const idx = inMemorySubjects.findIndex((s) => String(s.id) === id);
    if (idx !== -1) {
      inMemorySubjects[idx] = {
        ...inMemorySubjects[idx],
        ...updates,
        updated_at: new Date().toISOString()
      };
    }

    const updated = await this.getSubjectById(id);

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

    return { subject: updated! };
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

    try {
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
    } catch {
      // Memory fallback
    }

    const existing = inMemoryCourseSubjects.find(
      (cs) =>
        String(cs.course_id) === input.courseId &&
        String(cs.subject_id) === subjectId &&
        cs.semester_number === input.semesterNumber
    );
    if (existing) return { error: "ALREADY_MAPPED" };

    const newMap: CourseSubjectRow = {
      id: nextMappingId++,
      course_id: Number(input.courseId),
      subject_id: Number(subjectId),
      semester_number: input.semesterNumber,
      is_mandatory: input.isMandatory !== false ? 1 : 0,
      created_at: new Date().toISOString()
    };
    inMemoryCourseSubjects.push(newMap);

    return {
      mapping: {
        id: String(newMap.id),
        courseId: input.courseId,
        subjectId,
        semesterNumber: input.semesterNumber,
        isMandatory: Boolean(newMap.is_mandatory),
        createdAt: new Date(newMap.created_at).toISOString()
      }
    };
  }

  static async unmapSubjectFromCourse(
    subjectId: string,
    courseId: string,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ success: boolean; error?: string }> {
    try {
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
    } catch {
      // Memory fallback
    }

    const idx = inMemoryCourseSubjects.findIndex(
      (cs) => String(cs.subject_id) === subjectId && String(cs.course_id) === courseId
    );
    if (idx !== -1) inMemoryCourseSubjects.splice(idx, 1);

    return { success: true };
  }

  static async getSubjectsForCourse(courseId: string): Promise<SubjectDto[]> {
    try {
      const db = getDb();
      const rows = await db("course_subjects as cs")
        .join("subjects as s", "cs.subject_id", "s.id")
        .leftJoin("departments as d", "s.department_id", "d.id")
        .where("cs.course_id", courseId)
        .select("s.*", "d.name as department_name", "d.code as department_code")
        .orderBy("cs.semester_number", "asc")
        .orderBy("s.code", "asc");

      return rows.map((r) => mapSubjectRowToDto(r));
    } catch {
      // Memory fallback
    }

    const subIds = inMemoryCourseSubjects
      .filter((cs) => String(cs.course_id) === courseId)
      .map((cs) => cs.subject_id);

    return inMemorySubjects
      .filter((s) => subIds.includes(s.id))
      .map((r) => mapSubjectRowToDto(r));
  }
}
