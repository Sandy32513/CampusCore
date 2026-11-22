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
  const existingCse = await knex("departments").where({ id: 1 }).orWhere({ code: "CSE" }).first();
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

  const existingEce = await knex("departments").where({ id: 2 }).orWhere({ code: "ECE" }).first();
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
  const existingYear = await knex("academic_years").where({ id: 1 }).orWhere({ name: "2026-2027" }).first();
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
  const cseDept = await knex("departments").where({ id: 1 }).orWhere({ code: "CSE" }).first();
  const deptId = cseDept?.id || 1;

  const existingCs101 = await knex("courses").where({ id: 1 }).orWhere({ code: "CS101" }).first();
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

  const existingAi201 = await knex("courses").where({ id: 2 }).orWhere({ code: "AI201" }).first();
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

  // 5. Subjects (V9)
  const existingSub1 = await knex("subjects").where({ id: 1 }).orWhere({ code: "CS101-TH" }).first();
  let sub1Id = existingSub1?.id;
  if (!existingSub1) {
    const [id] = await knex("subjects").insert({
      id: 1,
      code: "CS101-TH",
      name: "Introduction to Computer Systems & Programming",
      department_id: deptId,
      type: "THEORY",
      credits: 4,
      theory_credits: 3,
      practical_credits: 1,
      is_elective: false,
      is_active: true,
      description: "Fundamental principles of computing and structured programming."
    });
    sub1Id = id || 1;
  }

  const existingSub2 = await knex("subjects").where({ id: 2 }).orWhere({ code: "CS102-DS" }).first();
  let sub2Id = existingSub2?.id;
  if (!existingSub2) {
    const [id] = await knex("subjects").insert({
      id: 2,
      code: "CS102-DS",
      name: "Data Structures & Algorithm Design",
      department_id: deptId,
      type: "THEORY",
      credits: 4,
      theory_credits: 3,
      practical_credits: 1,
      is_elective: false,
      is_active: true,
      description: "Linear and non-linear data structures, trees, graphs, and complexity."
    });
    sub2Id = id || 2;
  }

  const existingSub3 = await knex("subjects").where({ id: 3 }).orWhere({ code: "CS103-LB" }).first();
  let sub3Id = existingSub3?.id;
  if (!existingSub3) {
    const [id] = await knex("subjects").insert({
      id: 3,
      code: "CS103-LB",
      name: "Computing & Software Development Laboratory",
      department_id: deptId,
      type: "PRACTICAL",
      credits: 2,
      theory_credits: 0,
      practical_credits: 2,
      is_elective: false,
      is_active: true,
      description: "Hands-on implementation of algorithms in C/C++ and modern systems."
    });
    sub3Id = id || 3;
  }

  // 6. Course Subjects Mapping (V9)
  const existingMap1 = await knex("course_subjects").where({ course_id: 1, subject_id: sub1Id, semester_number: 1 }).first();
  if (!existingMap1) {
    await knex("course_subjects").insert({
      course_id: 1,
      subject_id: sub1Id,
      semester_number: 1,
      is_mandatory: true
    });
  }

  const existingMap2 = await knex("course_subjects").where({ course_id: 1, subject_id: sub3Id, semester_number: 1 }).first();
  if (!existingMap2) {
    await knex("course_subjects").insert({
      course_id: 1,
      subject_id: sub3Id,
      semester_number: 1,
      is_mandatory: true
    });
  }

  // 7. Students (V4)
  const sem1 = await knex("semesters").where({ term_number: 1 }).first();
  const semesterId = sem1?.id || 1;

  const existingStudentRec = await knex("students").where({ id: 1 }).orWhere({ admission_number: "ADM2026001" }).first();
  if (!existingStudentRec) {
    await knex("students").insert({
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
      department_id: deptId,
      course_id: 1,
      current_semester_id: semesterId,
      admission_date: "2026-08-01",
      status: "ACTIVE",
      emergency_contact_name: "Jane Student",
      emergency_contact_phone: "+1-555-0145",
      address_line1: "456 Campus Green Blvd",
      city: "Cambridge",
      state: "MA",
      postal_code: "02138",
      country: "USA"
    });
  }

  // 8. Database Backups (V40)
  const existingBackup = await knex("database_backups").where({ id: 1 }).orWhere({ filename: "backup_baseline_20261122.sql" }).first();
  if (!existingBackup) {
    await knex("database_backups").insert({
      id: 1,
      filename: "backup_baseline_20261122.sql",
      filepath: "./storage/backups/backup_baseline_20261122.sql",
      file_size_bytes: 1048576,
      backup_type: "FULL",
      status: "COMPLETED",
      checksum_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      created_by_user_id: 1,
      retention_days: 30,
      notes: "System baseline snapshot after Wave 6 completion",
      completed_at: knex.fn.now()
    });
  }

  // 9. Audit Log Bootstrap Entry
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
