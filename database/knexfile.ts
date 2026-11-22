import type { Knex } from "knex";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST || "127.0.0.1",
      port: parseInt(process.env.DB_PORT || "3306", 10),
      user: process.env.DB_MIGRATOR_USER || "sms_migrator",
      password: process.env.DB_MIGRATOR_PASSWORD || "",
      database: process.env.DB_NAME || "sms_dev",
      charset: "utf8mb4"
    },
    migrations: {
      directory: "./migrations",
      extension: "ts"
    },
    seeds: {
      directory: "./seeds",
      extension: "ts"
    }
  },
  test: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST || "127.0.0.1",
      port: parseInt(process.env.DB_PORT || "3306", 10),
      user: process.env.DB_MIGRATOR_USER || "sms_migrator",
      password: process.env.DB_MIGRATOR_PASSWORD || "",
      database: process.env.DB_TEST_NAME || "sms_test",
      charset: "utf8mb4"
    },
    migrations: {
      directory: "./migrations",
      extension: "ts"
    },
    seeds: {
      directory: "./seeds",
      extension: "ts"
    }
  }
};

export default config;
