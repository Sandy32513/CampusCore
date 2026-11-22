import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // 1. Roles table
  await knex.schema.createTable("roles", (table) => {
    table.increments("id").primary();
    table.string("name", 50).notNullable().unique();
    table.string("description", 255).notNullable();
    table.boolean("is_system").notNullable().defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // 2. Permissions table
  await knex.schema.createTable("permissions", (table) => {
    table.increments("id").primary();
    table.string("resource", 50).notNullable();
    table.string("action", 50).notNullable();
    table.string("description", 255).notNullable();
    table.unique(["resource", "action"]);
  });

  // 3. Role Permissions junction table
  await knex.schema.createTable("role_permissions", (table) => {
    table.integer("role_id").unsigned().notNullable()
      .references("id").inTable("roles").onDelete("CASCADE");
    table.integer("permission_id").unsigned().notNullable()
      .references("id").inTable("permissions").onDelete("CASCADE");
    table.primary(["role_id", "permission_id"]);
  });

  // Seed default 6 canonical roles
  await knex("roles").insert([
    { name: "SUPER_ADMIN", description: "Institution owner / IT lead with unrestricted access", is_system: true },
    { name: "ADMIN", description: "Registrar and academic operations officer", is_system: true },
    { name: "TEACHER", description: "Faculty member managing assigned classes, subjects, and marks", is_system: true },
    { name: "STAFF", description: "Operational staff for front-office, library, hostel, or transport", is_system: true },
    { name: "STUDENT", description: "Enrolled student with self-service view of own records", is_system: true },
    { name: "PARENT", description: "Guardian with read-only access to linked children", is_system: true }
  ]);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("role_permissions");
  await knex.schema.dropTableIfExists("permissions");
  await knex.schema.dropTableIfExists("roles");
}
