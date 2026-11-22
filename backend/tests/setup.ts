import { beforeAll } from "vitest";
import { getDb } from "../src/db/connection.js";
import { hashPassword } from "../src/utils/crypto.js";
import { inMemoryUsers } from "../src/db/userRepository.js";
import { inMemoryDepartments } from "../src/services/departmentService.js";
import { inMemoryStudents } from "../src/services/studentService.js";
import { inMemorySubjects, inMemoryCourseSubjects } from "../src/services/subjectService.js";
import { inMemoryBackups } from "../src/services/backupService.js";

beforeAll(async () => {
  try {
    const db = getDb();
    await db("database_backups").del();
    await db("course_subjects").del();
    await db("subjects").del();
    await db("students").del();
    await db("audit_logs").del();
    await db("courses").del();
    await db("semesters").del();
    await db("academic_years").del();
    await db("departments").del();
    await db("sessions").del();
    await db("users").del();

    // Reset in-memory stores to match DB seeds
    inMemoryUsers.length = 0;
    inMemoryDepartments.length = 0;
    inMemoryStudents.length = 0;
    inMemorySubjects.length = 0;
    inMemoryCourseSubjects.length = 0;
    inMemoryBackups.length = 0;

    // Re-seed baseline data
    const adminPasswordHash = await hashPassword("Admin@123456");
    const studentPasswordHash = await hashPassword("StudentPass123!");

    await db("users").insert([
      {
        id: 1,
        email: "admin@campuscore.edu",
        password_hash: adminPasswordHash,
        first_name: "System",
        last_name: "Administrator",
        role: "SUPER_ADMIN",
        is_active: true
      },
      {
        id: 2,
        email: "demo.student@campuscore.edu",
        password_hash: studentPasswordHash,
        first_name: "Demo",
        last_name: "Student",
        role: "STUDENT",
        is_active: true
      }
    ]);

    await db("departments").insert([
      {
        id: 1,
        code: "CSE",
        name: "Computer Science & Engineering",
        description: "Department of Computer Science and Engineering",
        head_of_department: "Dr. Alan Turing",
        is_active: true
      },
      {
        id: 2,
        code: "ECE",
        name: "Electronics & Communication Engineering",
        description: "Department of Electronics and Communication",
        head_of_department: "Dr. Claude Shannon",
        is_active: true
      }
    ]);

    await db("academic_years").insert({
      id: 1,
      name: "2026-2027",
      start_date: "2026-08-01",
      end_date: "2027-05-31",
      is_current: true,
      is_active: true
    });

    await db("semesters").insert([
      {
        id: 1,
        academic_year_id: 1,
        name: "Fall 2026",
        term_number: 1,
        start_date: "2026-08-01",
        end_date: "2026-12-15",
        is_active: true,
        is_closed: false
      },
      {
        id: 2,
        academic_year_id: 1,
        name: "Spring 2027",
        term_number: 2,
        start_date: "2027-01-10",
        end_date: "2027-05-31",
        is_active: false,
        is_closed: false
      }
    ]);

    await db("courses").insert([
      {
        id: 1,
        department_id: 1,
        code: "CS101",
        name: "B.Tech in Computer Science & Engineering",
        description: "Undergraduate computer science program",
        degree_level: "UNDERGRADUATE",
        duration_years: 4.0,
        total_credits: 160,
        is_active: true
      },
      {
        id: 2,
        department_id: 1,
        code: "AI201",
        name: "Bachelor of Technology in Artificial Intelligence",
        description: "Undergraduate artificial intelligence and machine learning program",
        degree_level: "UNDERGRADUATE",
        duration_years: 4.0,
        total_credits: 160,
        is_active: true
      }
    ]);

    await db("subjects").insert([
      {
        id: 1,
        code: "CS101-TH",
        name: "Introduction to Computer Systems & Programming",
        department_id: 1,
        type: "THEORY",
        credits: 4,
        theory_credits: 3,
        practical_credits: 1,
        is_elective: false,
        is_active: true
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
        is_elective: false,
        is_active: true
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
        is_elective: false,
        is_active: true
      }
    ]);

    await db("course_subjects").insert([
      { course_id: 1, subject_id: 1, semester_number: 1, is_mandatory: true },
      { course_id: 1, subject_id: 3, semester_number: 1, is_mandatory: true }
    ]);

    await db("students").insert({
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
      status: "ACTIVE"
    });

    await db("database_backups").insert({
      id: 1,
      filename: "backup_baseline_20261122.sql",
      filepath: "./storage/backups/backup_baseline_20261122.sql",
      file_size_bytes: 1048576,
      backup_type: "FULL",
      status: "COMPLETED",
      checksum_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      created_by_user_id: 1,
      retention_days: 30,
      notes: "System baseline snapshot",
      completed_at: new Date()
    });

    await db("audit_logs").insert({
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

    // Populate memory mirrors
    inMemoryStudents.push({
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
    });

    inMemorySubjects.push(
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
    );

    inMemoryCourseSubjects.push(
      { id: 1, course_id: 1, subject_id: 1, semester_number: 1, is_mandatory: 1, created_at: new Date().toISOString() },
      { id: 2, course_id: 1, subject_id: 3, semester_number: 1, is_mandatory: 1, created_at: new Date().toISOString() }
    );

    inMemoryBackups.push({
      id: 1,
      filename: "backup_baseline_20261122.sql",
      filepath: "./storage/backups/backup_baseline_20261122.sql",
      file_size_bytes: 1048576,
      backup_type: "FULL",
      status: "COMPLETED",
      checksum_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      created_by_user_id: 1,
      retention_days: 30,
      notes: "System baseline snapshot",
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("SETUP DB SEED ERROR:", err?.message || err);
  }
});
