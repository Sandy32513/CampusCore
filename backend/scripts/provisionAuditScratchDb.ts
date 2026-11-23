import knex from "knex";

const applicationDatabase = process.env.DB_TEST_NAME?.trim() ?? "";
const scratchDatabase = process.env.DB_RESTORE_TEST_NAME?.trim() ?? "";
const auditDatabasePattern = /^sms_audit_[a-z0-9_]+$/i;

if (!auditDatabasePattern.test(applicationDatabase)) {
  throw new Error("Scratch provisioning requires DB_TEST_NAME with the sms_audit_* prefix");
}
if (!auditDatabasePattern.test(scratchDatabase)) {
  throw new Error("Scratch provisioning requires DB_RESTORE_TEST_NAME with the sms_audit_* prefix");
}
if (scratchDatabase.toLowerCase() === applicationDatabase.toLowerCase()) {
  throw new Error("The restore scratch schema must differ from DB_TEST_NAME");
}

const port = Number(process.env.DB_PORT ?? "3306");
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("DB_PORT must be an integer between 1 and 65535");
}

const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST?.trim() || "127.0.0.1",
    port,
    user: process.env.DB_MIGRATOR_USER?.trim() || "sms_migrator",
    password: process.env.DB_MIGRATOR_PASSWORD || "",
    database: applicationDatabase,
    charset: "utf8mb4"
  },
  pool: { min: 0, max: 1 }
});

try {
  await db.raw("CREATE DATABASE IF NOT EXISTS ?? CHARACTER SET utf8mb4", [scratchDatabase]);
  const result = await db.raw(
    "SELECT SCHEMA_NAME AS schemaName FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?",
    [scratchDatabase]
  );
  const rows = Array.isArray(result) && Array.isArray(result[0]) ? result[0] : [];
  if (rows[0]?.schemaName !== scratchDatabase) {
    throw new Error("Restore scratch schema was not created as requested");
  }
  console.log(`Provisioned isolated restore scratch schema ${scratchDatabase}`);
} finally {
  await db.destroy();
}
