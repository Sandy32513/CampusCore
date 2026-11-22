import knex, { Knex } from "knex";
import { config } from "../config/env.js";

let dbInstance: Knex | null = null;

export function getDb(): Knex {
  if (!dbInstance) {
    dbInstance = knex({
      client: "mysql2",
      connection: {
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
        charset: "utf8mb4"
      },
      pool: { min: 2, max: 10 }
    });
  }
  return dbInstance;
}

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const db = getDb();
    await db.raw("SELECT 1 AS health");
    return true;
  } catch {
    return false;
  }
}
