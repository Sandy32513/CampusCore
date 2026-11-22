import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // 1. Departments table (V7)
  await knex.schema.createTable("departments", (table) => {
    table.increments("id").primary();
    table.string("code", 50).notNullable().unique();
    table.string("name", 150).notNullable();
    table.text("description").nullable();
    table.string("head_of_department", 150).nullable();
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // 2. Academic Years table (V10)
  await knex.schema.createTable("academic_years", (table) => {
    table.increments("id").primary();
    table.string("name", 50).notNullable().unique();
    table.date("start_date").notNullable();
    table.date("end_date").notNullable();
    table.boolean("is_current").notNullable().defaultTo(false);
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // 3. Semesters table (V10)
  await knex.schema.createTable("semesters", (table) => {
    table.increments("id").primary();
    table.integer("academic_year_id").unsigned().notNullable()
      .references("id").inTable("academic_years").onDelete("RESTRICT");
    table.string("name", 100).notNullable();
    table.integer("term_number").unsigned().notNullable();
    table.date("start_date").notNullable();
    table.date("end_date").notNullable();
    table.boolean("is_active").notNullable().defaultTo(false);
    table.boolean("is_closed").notNullable().defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.unique(["academic_year_id", "term_number"]);
  });

  // 4. Audit Logs table (V38)
  await knex.schema.createTable("audit_logs", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().nullable()
      .references("id").inTable("users").onDelete("SET NULL");
    table.string("user_email", 255).nullable();
    table.string("role", 50).nullable();
    table.string("action", 100).notNullable();
    table.string("entity", 100).notNullable();
    table.string("entity_id", 100).nullable();
    table.json("details").nullable();
    table.string("ip_address", 45).nullable();
    table.string("user_agent", 255).nullable();
    table.string("status", 20).notNullable().defaultTo("SUCCESS");
    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.index(["created_at"], "idx_audit_created_at");
    table.index(["user_id"], "idx_audit_user_id");
    table.index(["action", "entity"], "idx_audit_action_entity");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("audit_logs");
  await knex.schema.dropTableIfExists("semesters");
  await knex.schema.dropTableIfExists("academic_years");
  await knex.schema.dropTableIfExists("departments");
}
