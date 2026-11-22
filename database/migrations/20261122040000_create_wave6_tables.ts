import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // 1. Courses table (V8)
  await knex.schema.createTable("courses", (table) => {
    table.increments("id").primary();
    table.integer("department_id").unsigned().notNullable()
      .references("id").inTable("departments").onDelete("RESTRICT");
    table.string("code", 50).notNullable().unique();
    table.string("name", 150).notNullable();
    table.text("description").nullable();
    table.string("degree_level", 30).notNullable().defaultTo("UNDERGRADUATE");
    table.decimal("duration_years", 3, 1).notNullable().defaultTo(4.0);
    table.integer("total_credits").unsigned().notNullable().defaultTo(120);
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index(["department_id"], "idx_courses_department_id");
  });

  // 2. System Settings table (V39)
  await knex.schema.createTable("system_settings", (table) => {
    table.increments("id").primary();
    table.string("category", 50).notNullable().defaultTo("GENERAL");
    table.string("setting_key", 100).notNullable().unique();
    table.text("setting_value").notNullable();
    table.boolean("is_public").notNullable().defaultTo(false);
    table.string("description", 255).nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index(["category"], "idx_settings_category");
    table.index(["is_public"], "idx_settings_is_public");
  });

  // Seed default institutional settings
  await knex("system_settings").insert([
    { category: "INSTITUTION", setting_key: "institution_name", setting_value: "CampusCore University", is_public: true, description: "Official name of the institution" },
    { category: "INSTITUTION", setting_key: "institution_code", setting_value: "CCU", is_public: true, description: "Short accreditation or institutional code" },
    { category: "INSTITUTION", setting_key: "contact_email", setting_value: "admin@campuscore.edu", is_public: true, description: "Primary institutional contact email" },
    { category: "INSTITUTION", setting_key: "contact_phone", setting_value: "+1-800-555-0199", is_public: true, description: "Primary contact phone" },
    { category: "INSTITUTION", setting_key: "address", setting_value: "100 Innovation Way, Tech Campus", is_public: true, description: "Physical campus address" },
    { category: "LOCALIZATION", setting_key: "timezone", setting_value: "UTC", is_public: true, description: "Default institutional timezone" },
    { category: "LOCALIZATION", setting_key: "date_format", setting_value: "YYYY-MM-DD", is_public: true, description: "Default date display format" },
    { category: "LOCALIZATION", setting_key: "time_format", setting_value: "24H", is_public: true, description: "Default time display format" },
    { category: "LOCALIZATION", setting_key: "currency", setting_value: "USD", is_public: true, description: "Default currency code" },
    { category: "LOCALIZATION", setting_key: "currency_symbol", setting_value: "$", is_public: true, description: "Default currency symbol" },
    { category: "ACADEMIC", setting_key: "attendance_threshold_pct", setting_value: "75", is_public: true, description: "Minimum attendance percentage required for exam eligibility" },
    { category: "SECURITY", setting_key: "session_timeout_minutes", setting_value: "480", is_public: false, description: "Maximum session lifetime before re-authentication" },
    { category: "SECURITY", setting_key: "allow_student_registration", setting_value: "false", is_public: false, description: "Whether public self-registration is enabled for students" }
  ]);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("system_settings");
  await knex.schema.dropTableIfExists("courses");
}
