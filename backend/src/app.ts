import express from "express";
import cors from "cors";
import helmet from "helmet";
import { healthRouter } from "./routes/health.js";
import { modulesRouter } from "./routes/modules.js";
import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { rolesRouter, permissionsRouter } from "./routes/roles.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Health routes
  app.use("/health", healthRouter);
  app.use("/api/v1/health", healthRouter);

  // Module Registry routes
  app.use("/api/v1/modules", modulesRouter);

  // Authentication routes
  app.use("/api/v1/auth", authRouter);

  // User & Role Management routes
  app.use("/api/v1/users", usersRouter);
  app.use("/api/v1/roles", rolesRouter);
  app.use("/api/v1/permissions", permissionsRouter);

  // Central error handling
  app.use(errorHandler);

  return app;
}
