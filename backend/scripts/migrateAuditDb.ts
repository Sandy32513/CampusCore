import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import knex from "knex";

const databaseName = process.env.DB_TEST_NAME?.trim() ?? "";
if (!/^sms_audit_[a-z0-9_]+$/i.test(databaseName)) {
  throw new Error("Migration validation requires DB_TEST_NAME with the sms_audit_* prefix");
}

const port = Number(process.env.DB_PORT ?? "3306");
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("DB_PORT must be an integer between 1 and 65535");
}

const migrationsDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../database/migrations"
);
const migrationFiles = (await readdir(migrationsDirectory))
  .filter((filename) => filename.endsWith(".ts"))
  .sort((left, right) => left.localeCompare(right));

if (migrationFiles.length === 0) throw new Error("No TypeScript migrations were found");

const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST?.trim() || "127.0.0.1",
    port,
    user: process.env.DB_MIGRATOR_USER?.trim() || "sms_migrator",
    password: process.env.DB_MIGRATOR_PASSWORD || "",
    database: databaseName,
    charset: "utf8mb4"
  },
  migrations: {
    directory: migrationsDirectory,
    extension: "ts"
  }
});

try {
  for (const filename of migrationFiles) {
    const [, applied] = await db.migrate.up({ name: filename });
    if (!applied.includes(filename)) throw new Error(`Migration did not apply: ${filename}`);
  }
  console.log(`Applied ${migrationFiles.length} migrations to ${databaseName}`);

  const latestMigration = migrationFiles.at(-1)!;
  const [, rolledBack] = await db.migrate.rollback();
  if (!rolledBack.includes(latestMigration)) {
    throw new Error(`Latest migration did not roll back: ${latestMigration}`);
  }
  console.log(`Rolled back latest migration ${latestMigration}`);

  const [, reapplied] = await db.migrate.up({ name: latestMigration });
  if (!reapplied.includes(latestMigration)) {
    throw new Error(`Latest migration did not reapply: ${latestMigration}`);
  }
  console.log(`Reapplied latest migration ${latestMigration}`);
} finally {
  await db.destroy();
}
