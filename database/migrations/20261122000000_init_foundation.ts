import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Foundation metadata check table
  await knex.schema.createTable("system_metadata", (table) => {
    table.string("key", 100).primary();
    table.string("value", 255).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("system_metadata");
}
