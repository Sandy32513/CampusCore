import dotenv from "dotenv";
dotenv.config();

export interface AppConfig {
  nodeEnv: string;
  port: number;
  appBaseUrl: string;
  db: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
}

export const config: AppConfig = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.API_PORT || "5000", 10),
  appBaseUrl: process.env.APP_BASE_URL || "http://localhost:3000",
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    database: (process.env.NODE_ENV === "test" ? process.env.DB_TEST_NAME : process.env.DB_NAME) || (process.env.NODE_ENV === "test" ? "sms_test" : "sms_dev"),
    user: process.env.DB_APP_USER || "sms_app",
    password: process.env.DB_APP_PASSWORD || ""
  }
};
