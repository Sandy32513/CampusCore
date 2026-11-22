import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // 1. Students table (V4)
  await knex.schema.createTable("students", (table) => {
    table.bigIncrements("id").primary();
    table.bigInteger("user_id").unsigned().nullable()
      .references("id").inTable("users").onDelete("SET NULL");
    table.string("admission_number", 50).notNullable().unique();
    table.string("roll_number", 50).nullable();
    table.string("first_name", 100).notNullable();
    table.string("last_name", 100).notNullable();
    table.string("email", 255).notNullable().unique();
    table.string("phone", 30).nullable();
    table.date("date_of_birth").notNullable();
    table.string("gender", 20).notNullable().defaultTo("OTHER");
    table.string("blood_group", 10).nullable();
    table.integer("department_id").unsigned().notNullable()
      .references("id").inTable("departments").onDelete("RESTRICT");
    table.integer("course_id").unsigned().notNullable()
      .references("id").inTable("courses").onDelete("RESTRICT");
    table.integer("current_semester_id").unsigned().notNullable()
      .references("id").inTable("semesters").onDelete("RESTRICT");
    table.date("admission_date").notNullable();
    table.string("status", 30).notNullable().defaultTo("ACTIVE");
    table.string("emergency_contact_name", 100).nullable();
    table.string("emergency_contact_phone", 30).nullable();
    table.string("address_line1", 255).nullable();
    table.string("city", 100).nullable();
    table.string("state", 100).nullable();
    table.string("postal_code", 20).nullable();
    table.string("country", 100).notNullable().defaultTo("USA");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index(["department_id"], "idx_students_department_id");
    table.index(["course_id"], "idx_students_course_id");
    table.index(["current_semester_id"], "idx_students_semester_id");
    table.index(["status"], "idx_students_status");
  });

  // 2. Subjects table (V9)
  await knex.schema.createTable("subjects", (table) => {
    table.increments("id").primary();
    table.string("code", 50).notNullable().unique();
    table.string("name", 150).notNullable();
    table.integer("department_id").unsigned().notNullable()
      .references("id").inTable("departments").onDelete("RESTRICT");
    table.string("type", 30).notNullable().defaultTo("THEORY");
    table.integer("credits").unsigned().notNullable().defaultTo(3);
    table.integer("theory_credits").unsigned().notNullable().defaultTo(3);
    table.integer("practical_credits").unsigned().notNullable().defaultTo(0);
    table.boolean("is_elective").notNullable().defaultTo(false);
    table.boolean("is_active").notNullable().defaultTo(true);
    table.text("description").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index(["department_id"], "idx_subjects_department_id");
    table.index(["type"], "idx_subjects_type");
    table.index(["is_active"], "idx_subjects_is_active");
  });

  // 3. Course Subjects junction table (V9)
  await knex.schema.createTable("course_subjects", (table) => {
    table.increments("id").primary();
    table.integer("course_id").unsigned().notNullable()
      .references("id").inTable("courses").onDelete("CASCADE");
    table.integer("subject_id").unsigned().notNullable()
      .references("id").inTable("subjects").onDelete("CASCADE");
    table.integer("semester_number").unsigned().notNullable().defaultTo(1);
    table.boolean("is_mandatory").notNullable().defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.unique(["course_id", "subject_id", "semester_number"], "idx_course_subject_semester");
  });

  // 4. Database Backups table (V40)
  await knex.schema.createTable("database_backups", (table) => {
    table.increments("id").primary();
    table.string("filename", 255).notNullable().unique();
    table.string("filepath", 500).notNullable();
    table.bigInteger("file_size_bytes").unsigned().notNullable().defaultTo(0);
    table.string("backup_type", 30).notNullable().defaultTo("FULL");
    table.string("status", 30).notNullable().defaultTo("COMPLETED");
    table.string("checksum_sha256", 64).nullable();
    table.bigInteger("created_by_user_id").unsigned().nullable()
      .references("id").inTable("users").onDelete("SET NULL");
    table.integer("retention_days").unsigned().notNullable().defaultTo(30);
    table.text("notes").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("completed_at").nullable();

    table.index(["status"], "idx_backups_status");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("database_backups");
  await knex.schema.dropTableIfExists("course_subjects");
  await knex.schema.dropTableIfExists("subjects");
  await knex.schema.dropTableIfExists("students");
}
