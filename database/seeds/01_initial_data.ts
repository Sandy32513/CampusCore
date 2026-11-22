import { Knex } from "knex";
import crypto from "crypto";

async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

export async function seed(knex: Knex): Promise<void> {
  // 1. Users
  const adminPasswordHash = await hashPassword("Admin@123456");
  const studentPasswordHash = await hashPassword("StudentPass123!");

  const existingAdmin = await knex("users").where({ email: "admin@campuscore.edu" }).first();
  if (!existingAdmin) {
    await knex("users").insert({
      id: 1,
      email: "admin@campuscore.edu",
      password_hash: adminPasswordHash,
      first_name: "System",
      last_name: "Administrator",
      role: "SUPER_ADMIN",
      is_active: true
    });
  }

  const existingStudent = await knex("users").where({ email: "demo.student@campuscore.edu" }).first();
  if (!existingStudent) {
    await knex("users").insert({
      id: 2,
      email: "demo.student@campuscore.edu",
      password_hash: studentPasswordHash,
      first_name: "Demo",
      last_name: "Student",
      role: "STUDENT",
      is_active: true
    });
  }

  // 2. Departments
  const existingCse = await knex("departments").where({ code: "CSE" }).first();
  if (!existingCse) {
    await knex("departments").insert({
      id: 1,
      code: "CSE",
      name: "Computer Science & Engineering",
      description: "Department of Computer Science and Engineering",
      head_of_department: "Dr. Alan Turing",
      is_active: true
    });
  }

  const existingEce = await knex("departments").where({ code: "ECE" }).first();
  if (!existingEce) {
    await knex("departments").insert({
      id: 2,
      code: "ECE",
      name: "Electronics & Communication Engineering",
      description: "Department of Electronics and Communication",
      head_of_department: "Dr. Claude Shannon",
      is_active: true
    });
  }

  // 3. Academic Years & Semesters
  const existingYear = await knex("academic_years").where({ name: "2026-2027" }).first();
  let yearId = existingYear?.id;
  if (!existingYear) {
    const [insertedYearId] = await knex("academic_years").insert({
      id: 1,
      name: "2026-2027",
      start_date: "2026-08-01",
      end_date: "2027-05-31",
      is_current: true,
      is_active: true
    });
    yearId = insertedYearId || 1;
  }

  const existingSem1 = await knex("semesters").where({ academic_year_id: yearId, term_number: 1 }).first();
  if (!existingSem1) {
    await knex("semesters").insert({
      academic_year_id: yearId,
      name: "Fall 2026",
      term_number: 1,
      start_date: "2026-08-01",
      end_date: "2026-12-15",
      is_active: true,
      is_closed: false
    });
  }

  const existingSem2 = await knex("semesters").where({ academic_year_id: yearId, term_number: 2 }).first();
  if (!existingSem2) {
    await knex("semesters").insert({
      academic_year_id: yearId,
      name: "Spring 2027",
      term_number: 2,
      start_date: "2027-01-10",
      end_date: "2027-05-31",
      is_active: false,
      is_closed: false
    });
  }

  // 4. Courses
  const cseDept = await knex("departments").where({ code: "CSE" }).first();
  const deptId = cseDept?.id || 1;

  const existingCs101 = await knex("courses").where({ code: "CS101" }).first();
  if (!existingCs101) {
    await knex("courses").insert({
      id: 1,
      department_id: deptId,
      code: "CS101",
      name: "B.Tech in Computer Science & Engineering",
      description: "Undergraduate computer science program",
      degree_level: "UNDERGRADUATE",
      duration_years: 4.0,
      total_credits: 160,
      is_active: true
    });
  }

  const existingAi201 = await knex("courses").where({ code: "AI201" }).first();
  if (!existingAi201) {
    await knex("courses").insert({
      id: 2,
      department_id: deptId,
      code: "AI201",
      name: "Bachelor of Technology in Artificial Intelligence",
      description: "Undergraduate artificial intelligence and machine learning program",
      degree_level: "UNDERGRADUATE",
      duration_years: 4.0,
      total_credits: 160,
      is_active: true
    });
  }

  // 5. Audit Log Bootstrap Entry
  const existingLog = await knex("audit_logs").where({ action: "SYSTEM_BOOTSTRAP" }).first();
  if (!existingLog) {
    await knex("audit_logs").insert({
      id: 1,
      user_id: 1,
      user_email: "admin@campuscore.edu",
      role: "SUPER_ADMIN",
      action: "SYSTEM_BOOTSTRAP",
      entity: "SYSTEM",
      entity_id: "1",
      details: JSON.stringify({ message: "System initialized and seeded" }),
      ip_address: "127.0.0.1",
      user_agent: "System/Seed",
      status: "SUCCESS"
    });
  }
}
