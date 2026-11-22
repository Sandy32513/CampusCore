import express from "express";
import cors from "cors";
import helmet from "helmet";
import { healthRouter } from "./routes/health.js";
import { modulesRouter } from "./routes/modules.js";
import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { rolesRouter, permissionsRouter } from "./routes/roles.js";
import { departmentsRouter } from "./routes/departments.js";
import { academicYearsRouter, semestersRouter } from "./routes/academic.js";
import { auditRouter } from "./routes/audit.js";
import { coursesRouter } from "./routes/courses.js";
import { settingsRouter } from "./routes/settings.js";
import { studentsRouter } from "./routes/students.js";
import { subjectsRouter } from "./routes/subjects.js";
import { backupsRouter } from "./routes/backups.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5000",
        "http://127.0.0.1:5000"
      ],
      credentials: true
    })
  );
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

  // Wave 5 routes
  app.use("/api/v1/departments", departmentsRouter);
  app.use("/api/v1/academic-years", academicYearsRouter);
  app.use("/api/v1/semesters", semestersRouter);
  app.use("/api/v1/audit-logs", auditRouter);

  // Wave 6 routes
  app.use("/api/v1/courses", coursesRouter);
  app.use("/api/v1/settings", settingsRouter);

  // Wave 7 routes
  app.use("/api/v1/students", studentsRouter);
  app.use("/api/v1/subjects", subjectsRouter);
  app.use("/api/v1/backups", backupsRouter);

  // Central error handling
  app.use(errorHandler);

  return app;
}
