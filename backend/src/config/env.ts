import dotenv from "dotenv";

if (process.env.NODE_ENV !== "test") dotenv.config();

export interface AppConfig {
  nodeEnv: string;
  port: number;
  appBaseUrl: string;
  corsOrigins: string[];
  storageDir: string;
  db: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
}

function parsePort(value: string | undefined, fallback: number, key: string): number {
  const port = value === undefined || value.trim() === "" ? fallback : Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`${key} must be an integer between 1 and 65535`);
  }
  return port;
}

function parseHttpOrigin(value: string, key: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${key} must contain valid HTTP or HTTPS origins`);
  }
  if (!(["http:", "https:"].includes(url.protocol)) || url.username || url.password) {
    throw new Error(`${key} must contain valid HTTP or HTTPS origins`);
  }
  return url.origin;
}

export function createAppConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  const nodeEnv = environment.NODE_ENV?.trim() || "development";
  const appBaseUrl = environment.APP_BASE_URL?.trim() || "http://localhost:3000";
  const appOrigin = parseHttpOrigin(appBaseUrl, "APP_BASE_URL");
  if (nodeEnv === "production" && !appOrigin.startsWith("https://")) {
    throw new Error("APP_BASE_URL must use HTTPS in production");
  }

  const configuredOrigins = (environment.CORS_ORIGINS || "http://127.0.0.1:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => parseHttpOrigin(origin, "CORS_ORIGINS"));
  const testDatabase = environment.DB_TEST_NAME?.trim() || "sms_audit_test";
  if (nodeEnv === "test" && !/^sms_audit_[a-z0-9_]+$/i.test(testDatabase)) {
    throw new Error("DB_TEST_NAME must use the sms_audit_* prefix; integration tests never write to sms_test");
  }
  const database = nodeEnv === "test" ? testDatabase : environment.DB_NAME?.trim() || "sms_dev";
  if (!/^[A-Za-z0-9_]+$/.test(database)) {
    throw new Error("Database names may contain only letters, numbers, and underscores");
  }
  if (nodeEnv === "production" && !environment.DB_APP_PASSWORD?.trim()) {
    throw new Error("DB_APP_PASSWORD is required in production");
  }

  return {
    nodeEnv,
    port: parsePort(environment.API_PORT, 5000, "API_PORT"),
    appBaseUrl,
    corsOrigins: [...new Set([appOrigin, ...configuredOrigins])],
    storageDir: environment.STORAGE_DIR?.trim() || "./storage",
    db: {
      host: environment.DB_HOST?.trim() || "127.0.0.1",
      port: parsePort(environment.DB_PORT, 3306, "DB_PORT"),
      database,
      user: environment.DB_APP_USER?.trim() || "sms_app",
      password: environment.DB_APP_PASSWORD || ""
    }
  };
}

export const config = createAppConfig();
