import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // 1. Users Table
  await knex.schema.createTable("users", (table) => {
    table.bigIncrements("id").primary();
    table.string("email", 255).notNullable().unique();
    table.string("password_hash", 255).notNullable();
    table.string("first_name", 100).notNullable();
    table.string("last_name", 100).notNullable();
    table.string("role", 50).notNullable().defaultTo("STUDENT");
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index(["email"]);
    table.index(["role"]);
  });

  // 2. Sessions Table
  await knex.schema.createTable("sessions", (table) => {
    table.bigIncrements("id").primary();
    table.bigInteger("user_id").unsigned().notNullable()
      .references("id").inTable("users").onDelete("CASCADE");
    table.string("token_hash", 64).notNullable().unique();
    table.string("ip_address", 45).nullable();
    table.string("user_agent", 255).nullable();
    table.timestamp("expires_at").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.index(["token_hash"]);
    table.index(["user_id"]);
    table.index(["expires_at"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("sessions");
  await knex.schema.dropTableIfExists("users");
}
