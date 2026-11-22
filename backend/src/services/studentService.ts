import {
  StudentDto,
  CreateStudentInput,
  UpdateStudentInput,
  QueryStudentsInput,
  StudentStatus,
  UserDto
} from "@campuscore/shared";
import { getDb } from "../db/connection.js";
import { AuditService } from "./auditService.js";

export interface StudentRow {
  id: number;
  user_id: number | null;
  admission_number: string;
  roll_number: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | Date;
  gender: string;
  blood_group: string | null;
  department_id: number;
  course_id: number;
  current_semester_id: number;
  admission_date: string | Date;
  status: string;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export const inMemoryStudents: StudentRow[] = [
  {
    id: 1,
    user_id: 2,
    admission_number: "ADM2026001",
    roll_number: "26CSE001",
    first_name: "Demo",
    last_name: "Student",
    email: "demo.student@campuscore.edu",
    phone: "+1-555-0144",
    date_of_birth: "2004-05-15",
    gender: "MALE",
    blood_group: "O+",
    department_id: 1,
    course_id: 1,
    current_semester_id: 1,
    admission_date: "2026-08-01",
    status: "ACTIVE",
    emergency_contact_name: "Jane Student",
    emergency_contact_phone: "+1-555-0145",
    address_line1: "456 Campus Green Blvd",
    city: "Cambridge",
    state: "MA",
    postal_code: "02138",
    country: "USA",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let nextStudentId = 2;

function mapStudentRowToDto(r: any): StudentDto {
  return {
    id: String(r.id),
    userId: r.user_id ? String(r.user_id) : null,
    admissionNumber: r.admission_number,
    rollNumber: r.roll_number ?? null,
    firstName: r.first_name,
    lastName: r.last_name,
    fullName: `${r.first_name} ${r.last_name}`,
    email: r.email,
    phone: r.phone ?? null,
    dateOfBirth: typeof r.date_of_birth === "string" ? r.date_of_birth.slice(0, 10) : new Date(r.date_of_birth).toISOString().slice(0, 10),
    gender: r.gender as any,
    bloodGroup: r.blood_group as any,
    departmentId: String(r.department_id),
    departmentName: r.department_name ?? undefined,
    departmentCode: r.department_code ?? undefined,
    courseId: String(r.course_id),
    courseName: r.course_name ?? undefined,
    courseCode: r.course_code ?? undefined,
    currentSemesterId: String(r.current_semester_id),
    currentSemesterName: r.semester_name ?? undefined,
    admissionDate: typeof r.admission_date === "string" ? r.admission_date.slice(0, 10) : new Date(r.admission_date).toISOString().slice(0, 10),
    status: r.status as StudentStatus,
    emergencyContactName: r.emergency_contact_name ?? null,
    emergencyContactPhone: r.emergency_contact_phone ?? null,
    addressLine1: r.address_line1 ?? null,
    city: r.city ?? null,
    state: r.state ?? null,
    postalCode: r.postal_code ?? null,
    country: r.country,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString()
  };
}

export class StudentService {
  static async listStudents(
    query: QueryStudentsInput
  ): Promise<{ students: StudentDto[]; total: number }> {
    const { page = 1, pageSize = 20, departmentId, courseId, semesterId, status, q } = query;

    // 1. Try DB
    try {
      const db = getDb();
      let dbQuery = db("students as s")
        .leftJoin("departments as d", "s.department_id", "d.id")
        .leftJoin("courses as c", "s.course_id", "c.id")
        .leftJoin("semesters as sem", "s.current_semester_id", "sem.id")
        .select(
          "s.*",
          "d.name as department_name",
          "d.code as department_code",
          "c.name as course_name",
          "c.code as course_code",
          "sem.name as semester_name"
        );

      if (departmentId) dbQuery = dbQuery.where("s.department_id", departmentId);
      if (courseId) dbQuery = dbQuery.where("s.course_id", courseId);
      if (semesterId) dbQuery = dbQuery.where("s.current_semester_id", semesterId);
      if (status) dbQuery = dbQuery.where("s.status", status);

      if (q) {
        dbQuery = dbQuery.where((b) => {
          b.where("s.admission_number", "like", `%${q}%`)
            .orWhere("s.roll_number", "like", `%${q}%`)
            .orWhere("s.first_name", "like", `%${q}%`)
            .orWhere("s.last_name", "like", `%${q}%`)
            .orWhere("s.email", "like", `%${q}%`);
        });
      }

      const totalResult = await dbQuery.clone().clearSelect().count<{ count: number }>("s.id as count").first();
      const total = Number(totalResult?.count || 0);
      const rows = await dbQuery
        .offset((page - 1) * pageSize)
        .limit(pageSize)
        .orderBy("s.id", "desc");

      return {
        students: rows.map(mapStudentRowToDto),
        total
      };
    } catch {
      // Memory fallback
    }

    let filtered = [...inMemoryStudents];
    if (departmentId) filtered = filtered.filter((s) => String(s.department_id) === departmentId);
    if (courseId) filtered = filtered.filter((s) => String(s.course_id) === courseId);
    if (semesterId) filtered = filtered.filter((s) => String(s.current_semester_id) === semesterId);
    if (status) filtered = filtered.filter((s) => s.status === status);

    if (q) {
      const qLower = q.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.admission_number.toLowerCase().includes(qLower) ||
          (s.roll_number && s.roll_number.toLowerCase().includes(qLower)) ||
          s.first_name.toLowerCase().includes(qLower) ||
          s.last_name.toLowerCase().includes(qLower) ||
          s.email.toLowerCase().includes(qLower)
      );
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    return {
      students: paginated.map((r) => mapStudentRowToDto(r)),
      total
    };
  }

  static async getStudentById(id: string): Promise<StudentDto | null> {
    try {
      const db = getDb();
      const row = await db("students as s")
        .leftJoin("departments as d", "s.department_id", "d.id")
        .leftJoin("courses as c", "s.course_id", "c.id")
        .leftJoin("semesters as sem", "s.current_semester_id", "sem.id")
        .where("s.id", id)
        .select(
          "s.*",
          "d.name as department_name",
          "d.code as department_code",
          "c.name as course_name",
          "c.code as course_code",
          "sem.name as semester_name"
        )
        .first();

      if (row) return mapStudentRowToDto(row);
    } catch {
      // Memory fallback
    }

    const row = inMemoryStudents.find((s) => String(s.id) === id);
    if (!row) return null;
    return mapStudentRowToDto(row);
  }

  static async createStudent(
    input: CreateStudentInput,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ student?: StudentDto; error?: string }> {
    const admissionNumber = input.admissionNumber?.trim() || `ADM${Date.now().toString().slice(-6)}`;
    const email = input.email.trim().toLowerCase();

    // 1. Uniqueness check
    try {
      const db = getDb();
      const existing = await db("students")
        .where({ admission_number: admissionNumber })
        .orWhere({ email })
        .first();

      if (existing) {
        if (existing.email === email) return { error: "DUPLICATE_EMAIL" };
        return { error: "DUPLICATE_ADMISSION_NUMBER" };
      }

      // Check foreign keys exist
      const dept = await db("departments").where({ id: input.departmentId }).first();
      if (!dept) return { error: "DEPARTMENT_NOT_FOUND" };

      const course = await db("courses").where({ id: input.courseId }).first();
      if (!course) return { error: "COURSE_NOT_FOUND" };

      const sem = await db("semesters").where({ id: input.currentSemesterId }).first();
      if (!sem) return { error: "SEMESTER_NOT_FOUND" };

      const [insertId] = await db("students").insert({
        user_id: input.userId ? Number(input.userId) : null,
        admission_number: admissionNumber,
        roll_number: input.rollNumber ?? null,
        first_name: input.firstName.trim(),
        last_name: input.lastName.trim(),
        email,
        phone: input.phone ?? null,
        date_of_birth: input.dateOfBirth,
        gender: input.gender ?? "OTHER",
        blood_group: input.bloodGroup ?? null,
        department_id: Number(input.departmentId),
        course_id: Number(input.courseId),
        current_semester_id: Number(input.currentSemesterId),
        admission_date: input.admissionDate,
        status: input.status ?? "ACTIVE",
        emergency_contact_name: input.emergencyContactName ?? null,
        emergency_contact_phone: input.emergencyContactPhone ?? null,
        address_line1: input.addressLine1 ?? null,
        city: input.city ?? null,
        state: input.state ?? null,
        postal_code: input.postalCode ?? null,
        country: input.country ?? "USA"
      });

      const student = await this.getStudentById(String(insertId));

      await AuditService.log({
        userId: actor?.user.id,
        userEmail: actor?.user.email,
        role: actor?.user.role,
        action: "STUDENT_CREATE",
        entity: "STUDENT",
        entityId: String(insertId),
        details: { admissionNumber, email, courseId: input.courseId },
        ipAddress: actor?.ip,
        userAgent: actor?.userAgent,
        status: "SUCCESS"
      });

      return { student: student! };
    } catch {
      // Memory fallback
    }

    if (inMemoryStudents.some((s) => s.email === email)) return { error: "DUPLICATE_EMAIL" };
    if (inMemoryStudents.some((s) => s.admission_number === admissionNumber)) return { error: "DUPLICATE_ADMISSION_NUMBER" };

    const newRow: StudentRow = {
      id: nextStudentId++,
      user_id: input.userId ? Number(input.userId) : null,
      admission_number: admissionNumber,
      roll_number: input.rollNumber ?? null,
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      email,
      phone: input.phone ?? null,
      date_of_birth: input.dateOfBirth,
      gender: input.gender ?? "OTHER",
      blood_group: input.bloodGroup ?? null,
      department_id: Number(input.departmentId),
      course_id: Number(input.courseId),
      current_semester_id: Number(input.currentSemesterId),
      admission_date: input.admissionDate,
      status: input.status ?? "ACTIVE",
      emergency_contact_name: input.emergencyContactName ?? null,
      emergency_contact_phone: input.emergencyContactPhone ?? null,
      address_line1: input.addressLine1 ?? null,
      city: input.city ?? null,
      state: input.state ?? null,
      postal_code: input.postalCode ?? null,
      country: input.country ?? "USA",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    inMemoryStudents.push(newRow);
    const student = mapStudentRowToDto(newRow);

    await AuditService.log({
      userId: actor?.user.id,
      userEmail: actor?.user.email,
      role: actor?.user.role,
      action: "STUDENT_CREATE",
      entity: "STUDENT",
      entityId: student.id,
      details: { admissionNumber, email },
      ipAddress: actor?.ip,
      userAgent: actor?.userAgent,
      status: "SUCCESS"
    });

    return { student };
  }

  static async updateStudent(
    id: string,
    input: UpdateStudentInput,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ student?: StudentDto; error?: string }> {
    const existing = await this.getStudentById(id);
    if (!existing) return { error: "NOT_FOUND" };

    if (input.email) {
      const email = input.email.trim().toLowerCase();
      try {
        const db = getDb();
        const conflict = await db("students")
          .where({ email })
          .andWhereNot({ id })
          .first();
        if (conflict) return { error: "DUPLICATE_EMAIL" };
      } catch {
        if (inMemoryStudents.some((s) => s.email === email && String(s.id) !== id)) {
          return { error: "DUPLICATE_EMAIL" };
        }
      }
    }

    const updates: any = {
      updated_at: new Date()
    };

    if (input.firstName !== undefined) updates.first_name = input.firstName.trim();
    if (input.lastName !== undefined) updates.last_name = input.lastName.trim();
    if (input.email !== undefined) updates.email = input.email.trim().toLowerCase();
    if (input.phone !== undefined) updates.phone = input.phone;
    if (input.rollNumber !== undefined) updates.roll_number = input.rollNumber;
    if (input.dateOfBirth !== undefined) updates.date_of_birth = input.dateOfBirth;
    if (input.gender !== undefined) updates.gender = input.gender;
    if (input.bloodGroup !== undefined) updates.blood_group = input.bloodGroup;
    if (input.departmentId !== undefined) updates.department_id = Number(input.departmentId);
    if (input.courseId !== undefined) updates.course_id = Number(input.courseId);
    if (input.currentSemesterId !== undefined) updates.current_semester_id = Number(input.currentSemesterId);
    if (input.admissionDate !== undefined) updates.admission_date = input.admissionDate;
    if (input.status !== undefined) updates.status = input.status;
    if (input.emergencyContactName !== undefined) updates.emergency_contact_name = input.emergencyContactName;
    if (input.emergencyContactPhone !== undefined) updates.emergency_contact_phone = input.emergencyContactPhone;
    if (input.addressLine1 !== undefined) updates.address_line1 = input.addressLine1;
    if (input.city !== undefined) updates.city = input.city;
    if (input.state !== undefined) updates.state = input.state;
    if (input.postalCode !== undefined) updates.postal_code = input.postalCode;
    if (input.country !== undefined) updates.country = input.country;

    try {
      const db = getDb();
      await db("students").where({ id }).update(updates);
      const updated = await this.getStudentById(id);

      await AuditService.log({
        userId: actor?.user.id,
        userEmail: actor?.user.email,
        role: actor?.user.role,
        action: "STUDENT_UPDATE",
        entity: "STUDENT",
        entityId: id,
        details: { changes: input },
        ipAddress: actor?.ip,
        userAgent: actor?.userAgent,
        status: "SUCCESS"
      });

      return { student: updated! };
    } catch {
      // Memory fallback
    }

    const idx = inMemoryStudents.findIndex((s) => String(s.id) === id);
    if (idx !== -1) {
      inMemoryStudents[idx] = {
        ...inMemoryStudents[idx],
        ...updates,
        updated_at: new Date().toISOString()
      };
    }

    const updated = await this.getStudentById(id);

    await AuditService.log({
      userId: actor?.user.id,
      userEmail: actor?.user.email,
      role: actor?.user.role,
      action: "STUDENT_UPDATE",
      entity: "STUDENT",
      entityId: id,
      details: { changes: input },
      ipAddress: actor?.ip,
      userAgent: actor?.userAgent,
      status: "SUCCESS"
    });

    return { student: updated! };
  }

  static async toggleStudentStatus(
    id: string,
    status: StudentStatus,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ student?: StudentDto; error?: string }> {
    return this.updateStudent(id, { status }, actor);
  }

  static async deleteStudent(
    id: string,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ success: boolean; error?: string }> {
    const existing = await this.getStudentById(id);
    if (!existing) return { success: false, error: "NOT_FOUND" };

    try {
      const db = getDb();
      await db("students").where({ id }).del();
      await AuditService.log({
        userId: actor?.user.id,
        userEmail: actor?.user.email,
        role: actor?.user.role,
        action: "STUDENT_DELETE",
        entity: "STUDENT",
        entityId: id,
        details: { admissionNumber: existing.admissionNumber },
        ipAddress: actor?.ip,
        userAgent: actor?.userAgent,
        status: "SUCCESS"
      });
      return { success: true };
    } catch {
      // Memory fallback
    }

    const idx = inMemoryStudents.findIndex((s) => String(s.id) === id);
    if (idx !== -1) inMemoryStudents.splice(idx, 1);

    await AuditService.log({
      userId: actor?.user.id,
      userEmail: actor?.user.email,
      role: actor?.user.role,
      action: "STUDENT_DELETE",
      entity: "STUDENT",
      entityId: id,
      details: { admissionNumber: existing.admissionNumber },
      ipAddress: actor?.ip,
      userAgent: actor?.userAgent,
      status: "SUCCESS"
    });

    return { success: true };
  }
}
