import {
  AcademicYearDto,
  SemesterDto,
  CreateAcademicYearInput,
  UpdateAcademicYearInput,
  CreateSemesterInput,
  UpdateSemesterInput,
  QueryAcademicYearsInput,
  UserDto
} from "@campuscore/shared";
import { getDb } from "../db/connection.js";
import { AuditService } from "./auditService.js";

export interface AcademicYearRow {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_current: number | boolean;
  is_active: number | boolean;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface SemesterRow {
  id: number;
  academic_year_id: number;
  name: string;
  term_number: number;
  start_date: string;
  end_date: string;
  is_active: number | boolean;
  is_closed: number | boolean;
  created_at: string | Date;
  updated_at: string | Date;
}

export const inMemoryAcademicYears: AcademicYearRow[] = [
  {
    id: 1,
    name: "2026-2027",
    start_date: "2026-08-01",
    end_date: "2027-06-30",
    is_current: 1,
    is_active: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const inMemorySemesters: SemesterRow[] = [
  {
    id: 1,
    academic_year_id: 1,
    name: "Fall 2026",
    term_number: 1,
    start_date: "2026-08-01",
    end_date: "2026-12-20",
    is_active: 1,
    is_closed: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    academic_year_id: 1,
    name: "Spring 2027",
    term_number: 2,
    start_date: "2027-01-10",
    end_date: "2027-06-20",
    is_active: 0,
    is_closed: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let nextYearId = 2;
let nextSemesterId = 3;

export class AcademicService {
  // ===================== ACADEMIC YEARS =====================

  static async createAcademicYear(
    input: CreateAcademicYearInput,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ academicYear?: AcademicYearDto; error?: string }> {
    // 1. Check uniqueness (DB or Memory)
    try {
      const db = getDb();
      const existing = await db("academic_years").where({ name: input.name }).first();
      if (existing) {
        return { error: "DUPLICATE_NAME" };
      }

      if (input.isCurrent) {
        await db("academic_years").update({ is_current: false });
      }

      const [insertId] = await db("academic_years").insert({
        name: input.name,
        start_date: input.startDate,
        end_date: input.endDate,
        is_current: Boolean(input.isCurrent),
        is_active: true
      });

      const row = await db("academic_years").where({ id: insertId }).first();
      const academicYear: AcademicYearDto = {
        id: String(row.id),
        name: row.name,
        startDate: row.start_date,
        endDate: row.end_date,
        isCurrent: Boolean(row.is_current),
        isActive: Boolean(row.is_active),
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString(),
        semesters: []
      };

      await AuditService.log({
        userId: actor?.user.id,
        userEmail: actor?.user.email,
        role: actor?.user.role,
        action: "ACADEMIC_YEAR_CREATE",
        entity: "ACADEMIC_YEAR",
        entityId: academicYear.id,
        details: { name: academicYear.name, startDate: academicYear.startDate, endDate: academicYear.endDate },
        ipAddress: actor?.ip,
        userAgent: actor?.userAgent,
        status: "SUCCESS"
      });

      return { academicYear };
    } catch {
      // Memory fallback
    }

    if (inMemoryAcademicYears.some((y) => y.name === input.name)) {
      return { error: "DUPLICATE_NAME" };
    }

    if (input.isCurrent) {
      for (const y of inMemoryAcademicYears) {
        y.is_current = 0;
      }
    }

    const now = new Date().toISOString();
    const newYear: AcademicYearRow = {
      id: nextYearId++,
      name: input.name,
      start_date: input.startDate,
      end_date: input.endDate,
      is_current: input.isCurrent ? 1 : 0,
      is_active: 1,
      created_at: now,
      updated_at: now
    };
    inMemoryAcademicYears.push(newYear);

    const academicYear: AcademicYearDto = {
      id: String(newYear.id),
      name: newYear.name,
      startDate: newYear.start_date,
      endDate: newYear.end_date,
      isCurrent: Boolean(newYear.is_current),
      isActive: Boolean(newYear.is_active),
      createdAt: now,
      updatedAt: now,
      semesters: []
    };

    await AuditService.log({
      userId: actor?.user.id,
      userEmail: actor?.user.email,
      role: actor?.user.role,
      action: "ACADEMIC_YEAR_CREATE",
      entity: "ACADEMIC_YEAR",
      entityId: academicYear.id,
      details: { name: academicYear.name, startDate: academicYear.startDate, endDate: academicYear.endDate },
      ipAddress: actor?.ip,
      userAgent: actor?.userAgent,
      status: "SUCCESS"
    });

    return { academicYear };
  }

  static async listAcademicYears(
    query: QueryAcademicYearsInput
  ): Promise<{ academicYears: AcademicYearDto[]; total: number }> {
    const { page, pageSize, isCurrent } = query;

    // 1. Try DB
    try {
      const db = getDb();
      let dbQuery = db("academic_years");
      if (isCurrent !== undefined) {
        dbQuery = dbQuery.where("is_current", isCurrent);
      }

      const totalResult = await dbQuery.clone().count<{ count: number }>("id as count").first();
      const total = Number(totalResult?.count || 0);
      const rows = await dbQuery
        .offset((page - 1) * pageSize)
        .limit(pageSize)
        .orderBy("id", "desc");

      const academicYears: AcademicYearDto[] = [];
      for (const r of rows) {
        const semesters = await this.listSemesters(String(r.id));
        academicYears.push({
          id: String(r.id),
          name: r.name,
          startDate: r.start_date,
          endDate: r.end_date,
          isCurrent: Boolean(r.is_current),
          isActive: Boolean(r.is_active),
          createdAt: new Date(r.created_at).toISOString(),
          updatedAt: new Date(r.updated_at).toISOString(),
          semesters
        });
      }

      return { academicYears, total };
    } catch {
      // Memory fallback
    }

    let filtered = [...inMemoryAcademicYears];
    if (isCurrent !== undefined) {
      filtered = filtered.filter((y) => Boolean(y.is_current) === isCurrent);
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    const academicYears: AcademicYearDto[] = paginated.map((r) => {
      const semesters = inMemorySemesters
        .filter((s) => s.academic_year_id === r.id)
        .map((s) => ({
          id: String(s.id),
          academicYearId: String(s.academic_year_id),
          name: s.name,
          termNumber: s.term_number,
          startDate: s.start_date,
          endDate: s.end_date,
          isActive: Boolean(s.is_active),
          isClosed: Boolean(s.is_closed),
          createdAt: new Date(s.created_at).toISOString(),
          updatedAt: new Date(s.updated_at).toISOString()
        }));

      return {
        id: String(r.id),
        name: r.name,
        startDate: r.start_date,
        endDate: r.end_date,
        isCurrent: Boolean(r.is_current),
        isActive: Boolean(r.is_active),
        createdAt: new Date(r.created_at).toISOString(),
        updatedAt: new Date(r.updated_at).toISOString(),
        semesters
      };
    });

    return { academicYears, total };
  }

  static async getAcademicYearById(id: string): Promise<AcademicYearDto | null> {
    try {
      const db = getDb();
      const row = await db("academic_years").where({ id }).first();
      if (row) {
        const semesters = await this.listSemesters(id);
        return {
          id: String(row.id),
          name: row.name,
          startDate: row.start_date,
          endDate: row.end_date,
          isCurrent: Boolean(row.is_current),
          isActive: Boolean(row.is_active),
          createdAt: new Date(row.created_at).toISOString(),
          updatedAt: new Date(row.updated_at).toISOString(),
          semesters
        };
      }
    } catch {
      // Memory fallback
    }

    const row = inMemoryAcademicYears.find((y) => String(y.id) === id);
    if (!row) return null;

    const semesters = inMemorySemesters
      .filter((s) => s.academic_year_id === row.id)
      .map((s) => ({
        id: String(s.id),
        academicYearId: String(s.academic_year_id),
        name: s.name,
        termNumber: s.term_number,
        startDate: s.start_date,
        endDate: s.end_date,
        isActive: Boolean(s.is_active),
        isClosed: Boolean(s.is_closed),
        createdAt: new Date(s.created_at).toISOString(),
        updatedAt: new Date(s.updated_at).toISOString()
      }));

    return {
      id: String(row.id),
      name: row.name,
      startDate: row.start_date,
      endDate: row.end_date,
      isCurrent: Boolean(row.is_current),
      isActive: Boolean(row.is_active),
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
      semesters
    };
  }

  static async getCurrentAcademicYear(): Promise<AcademicYearDto | null> {
    try {
      const db = getDb();
      const row = await db("academic_years").where({ is_current: true }).first();
      if (row) {
        return this.getAcademicYearById(String(row.id));
      }
    } catch {
      // Memory fallback
    }

    const row = inMemoryAcademicYears.find((y) => Boolean(y.is_current));
    if (!row) return null;

    return this.getAcademicYearById(String(row.id));
  }

  static async updateAcademicYear(
    id: string,
    input: UpdateAcademicYearInput,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ academicYear?: AcademicYearDto; error?: string }> {
    const existing = await this.getAcademicYearById(id);
    if (!existing) return { error: "NOT_FOUND" };

    try {
      const db = getDb();
      if (input.isCurrent) {
        await db("academic_years").update({ is_current: false });
      }

      const updates: any = { updated_at: new Date() };
      if (input.name) updates.name = input.name;
      if (input.startDate) updates.start_date = input.startDate;
      if (input.endDate) updates.end_date = input.endDate;
      if (input.isCurrent !== undefined) updates.is_current = input.isCurrent;
      if (input.isActive !== undefined) updates.is_active = input.isActive;

      await db("academic_years").where({ id }).update(updates);
      const updated = await this.getAcademicYearById(id);

      await AuditService.log({
        userId: actor?.user.id,
        userEmail: actor?.user.email,
        role: actor?.user.role,
        action: "ACADEMIC_YEAR_UPDATE",
        entity: "ACADEMIC_YEAR",
        entityId: id,
        details: { changes: input },
        ipAddress: actor?.ip,
        userAgent: actor?.userAgent,
        status: "SUCCESS"
      });

      return { academicYear: updated! };
    } catch {
      // Memory fallback
    }

    if (input.isCurrent) {
      for (const y of inMemoryAcademicYears) {
        y.is_current = 0;
      }
    }

    const idx = inMemoryAcademicYears.findIndex((y) => String(y.id) === id);
    if (idx !== -1) {
      if (input.name) inMemoryAcademicYears[idx].name = input.name;
      if (input.startDate) inMemoryAcademicYears[idx].start_date = input.startDate;
      if (input.endDate) inMemoryAcademicYears[idx].end_date = input.endDate;
      if (input.isCurrent !== undefined) inMemoryAcademicYears[idx].is_current = input.isCurrent ? 1 : 0;
      if (input.isActive !== undefined) inMemoryAcademicYears[idx].is_active = input.isActive ? 1 : 0;
      inMemoryAcademicYears[idx].updated_at = new Date().toISOString();
    }

    const updated = await this.getAcademicYearById(id);

    await AuditService.log({
      userId: actor?.user.id,
      userEmail: actor?.user.email,
      role: actor?.user.role,
      action: "ACADEMIC_YEAR_UPDATE",
      entity: "ACADEMIC_YEAR",
      entityId: id,
      details: { changes: input },
      ipAddress: actor?.ip,
      userAgent: actor?.userAgent,
      status: "SUCCESS"
    });

    return { academicYear: updated! };
  }

  static async setCurrentAcademicYear(
    id: string,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ academicYear?: AcademicYearDto; error?: string }> {
    return this.updateAcademicYear(id, { isCurrent: true }, actor);
  }

  // ===================== SEMESTERS =====================

  static async listSemesters(yearId: string): Promise<SemesterDto[]> {
    try {
      const db = getDb();
      const rows = await db("semesters")
        .where({ academic_year_id: Number(yearId) })
        .orderBy("term_number", "asc");

      return rows.map((s) => ({
        id: String(s.id),
        academicYearId: String(s.academic_year_id),
        name: s.name,
        termNumber: s.term_number,
        startDate: s.start_date,
        endDate: s.end_date,
        isActive: Boolean(s.is_active),
        isClosed: Boolean(s.is_closed),
        createdAt: new Date(s.created_at).toISOString(),
        updatedAt: new Date(s.updated_at).toISOString()
      }));
    } catch {
      // Memory fallback
    }

    return inMemorySemesters
      .filter((s) => String(s.academic_year_id) === yearId)
      .sort((a, b) => a.term_number - b.term_number)
      .map((s) => ({
        id: String(s.id),
        academicYearId: String(s.academic_year_id),
        name: s.name,
        termNumber: s.term_number,
        startDate: s.start_date,
        endDate: s.end_date,
        isActive: Boolean(s.is_active),
        isClosed: Boolean(s.is_closed),
        createdAt: new Date(s.created_at).toISOString(),
        updatedAt: new Date(s.updated_at).toISOString()
      }));
  }

  static async createSemester(
    yearId: string,
    input: CreateSemesterInput,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ semester?: SemesterDto; error?: string }> {
    const year = await this.getAcademicYearById(yearId);
    if (!year) return { error: "YEAR_NOT_FOUND" };

    // Bounds check
    if (new Date(input.startDate) < new Date(year.startDate) || new Date(input.endDate) > new Date(year.endDate)) {
      return { error: "DATE_OUT_OF_BOUNDS" };
    }

    try {
      const db = getDb();
      const duplicateTerm = await db("semesters")
        .where({ academic_year_id: Number(yearId), term_number: input.termNumber })
        .first();
      if (duplicateTerm) {
        return { error: "DUPLICATE_TERM" };
      }

      if (input.isActive) {
        await db("semesters").update({ is_active: false });
      }

      const [insertId] = await db("semesters").insert({
        academic_year_id: Number(yearId),
        name: input.name,
        term_number: input.termNumber,
        start_date: input.startDate,
        end_date: input.endDate,
        is_active: Boolean(input.isActive),
        is_closed: false
      });

      const row = await db("semesters").where({ id: insertId }).first();
      const semester: SemesterDto = {
        id: String(row.id),
        academicYearId: String(row.academic_year_id),
        name: row.name,
        termNumber: row.term_number,
        startDate: row.start_date,
        endDate: row.end_date,
        isActive: Boolean(row.is_active),
        isClosed: Boolean(row.is_closed),
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString()
      };

      await AuditService.log({
        userId: actor?.user.id,
        userEmail: actor?.user.email,
        role: actor?.user.role,
        action: "SEMESTER_CREATE",
        entity: "SEMESTER",
        entityId: semester.id,
        details: { academicYearId: yearId, name: semester.name, termNumber: semester.termNumber },
        ipAddress: actor?.ip,
        userAgent: actor?.userAgent,
        status: "SUCCESS"
      });

      return { semester };
    } catch {
      // Memory fallback
    }

    const duplicate = inMemorySemesters.find(
      (s) => String(s.academic_year_id) === yearId && s.term_number === input.termNumber
    );
    if (duplicate) return { error: "DUPLICATE_TERM" };

    if (input.isActive) {
      for (const s of inMemorySemesters) {
        s.is_active = 0;
      }
    }

    const now = new Date().toISOString();
    const newSemester: SemesterRow = {
      id: nextSemesterId++,
      academic_year_id: Number(yearId),
      name: input.name,
      term_number: input.termNumber,
      start_date: input.startDate,
      end_date: input.endDate,
      is_active: input.isActive ? 1 : 0,
      is_closed: 0,
      created_at: now,
      updated_at: now
    };
    inMemorySemesters.push(newSemester);

    const semester: SemesterDto = {
      id: String(newSemester.id),
      academicYearId: String(newSemester.academic_year_id),
      name: newSemester.name,
      termNumber: newSemester.term_number,
      startDate: newSemester.start_date,
      endDate: newSemester.end_date,
      isActive: Boolean(newSemester.is_active),
      isClosed: Boolean(newSemester.is_closed),
      createdAt: now,
      updatedAt: now
    };

    await AuditService.log({
      userId: actor?.user.id,
      userEmail: actor?.user.email,
      role: actor?.user.role,
      action: "SEMESTER_CREATE",
      entity: "SEMESTER",
      entityId: semester.id,
      details: { academicYearId: yearId, name: semester.name, termNumber: semester.termNumber },
      ipAddress: actor?.ip,
      userAgent: actor?.userAgent,
      status: "SUCCESS"
    });

    return { semester };
  }

  static async getSemesterById(id: string): Promise<SemesterDto | null> {
    try {
      const db = getDb();
      const row = await db("semesters").where({ id }).first();
      if (row) {
        return {
          id: String(row.id),
          academicYearId: String(row.academic_year_id),
          name: row.name,
          termNumber: row.term_number,
          startDate: row.start_date,
          endDate: row.end_date,
          isActive: Boolean(row.is_active),
          isClosed: Boolean(row.is_closed),
          createdAt: new Date(row.created_at).toISOString(),
          updatedAt: new Date(row.updated_at).toISOString()
        };
      }
    } catch {
      // Memory fallback
    }

    const row = inMemorySemesters.find((s) => String(s.id) === id);
    if (!row) return null;

    return {
      id: String(row.id),
      academicYearId: String(row.academic_year_id),
      name: row.name,
      termNumber: row.term_number,
      startDate: row.start_date,
      endDate: row.end_date,
      isActive: Boolean(row.is_active),
      isClosed: Boolean(row.is_closed),
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  }

  static async updateSemester(
    id: string,
    input: UpdateSemesterInput,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ semester?: SemesterDto; error?: string }> {
    const existing = await this.getSemesterById(id);
    if (!existing) return { error: "NOT_FOUND" };

    try {
      const db = getDb();
      if (input.isActive) {
        await db("semesters").update({ is_active: false });
      }

      const updates: any = { updated_at: new Date() };
      if (input.name) updates.name = input.name;
      if (input.termNumber !== undefined) updates.term_number = input.termNumber;
      if (input.startDate) updates.start_date = input.startDate;
      if (input.endDate) updates.end_date = input.endDate;
      if (input.isActive !== undefined) updates.is_active = input.isActive;
      if (input.isClosed !== undefined) updates.is_closed = input.isClosed;

      await db("semesters").where({ id }).update(updates);
      const updated = await this.getSemesterById(id);

      await AuditService.log({
        userId: actor?.user.id,
        userEmail: actor?.user.email,
        role: actor?.user.role,
        action: "SEMESTER_UPDATE",
        entity: "SEMESTER",
        entityId: id,
        details: { changes: input },
        ipAddress: actor?.ip,
        userAgent: actor?.userAgent,
        status: "SUCCESS"
      });

      return { semester: updated! };
    } catch {
      // Memory fallback
    }

    if (input.isActive) {
      for (const s of inMemorySemesters) {
        s.is_active = 0;
      }
    }

    const idx = inMemorySemesters.findIndex((s) => String(s.id) === id);
    if (idx !== -1) {
      if (input.name) inMemorySemesters[idx].name = input.name;
      if (input.termNumber !== undefined) inMemorySemesters[idx].term_number = input.termNumber;
      if (input.startDate) inMemorySemesters[idx].start_date = input.startDate;
      if (input.endDate) inMemorySemesters[idx].end_date = input.endDate;
      if (input.isActive !== undefined) inMemorySemesters[idx].is_active = input.isActive ? 1 : 0;
      if (input.isClosed !== undefined) inMemorySemesters[idx].is_closed = input.isClosed ? 1 : 0;
      inMemorySemesters[idx].updated_at = new Date().toISOString();
    }

    const updated = await this.getSemesterById(id);

    await AuditService.log({
      userId: actor?.user.id,
      userEmail: actor?.user.email,
      role: actor?.user.role,
      action: "SEMESTER_UPDATE",
      entity: "SEMESTER",
      entityId: id,
      details: { changes: input },
      ipAddress: actor?.ip,
      userAgent: actor?.userAgent,
      status: "SUCCESS"
    });

    return { semester: updated! };
  }

  static async activateSemester(
    id: string,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ semester?: SemesterDto; error?: string }> {
    return this.updateSemester(id, { isActive: true }, actor);
  }
}
