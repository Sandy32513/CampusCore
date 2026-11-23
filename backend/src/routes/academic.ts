import { Router, Request, Response } from "express";
import {
  createAcademicYearSchema,
  updateAcademicYearSchema,
  createSemesterSchema,
  updateSemesterSchema,
  queryAcademicYearsSchema
} from "@campuscore/shared";
import { AcademicService } from "../services/academicService.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorize.js";

export const academicYearsRouter = Router();
export const semestersRouter = Router();

// ================= ACADEMIC YEARS ROUTER =================
academicYearsRouter.use(requireAuth);

// GET /api/v1/academic-years
academicYearsRouter.get("/", async (req: Request, res: Response) => {
  const queryResult = queryAcademicYearsSchema.safeParse(req.query);
  if (!queryResult.success) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid query parameters" }
    });
    return;
  }

  const { academicYears, total } = await AcademicService.listAcademicYears(queryResult.data);
  const totalPages = Math.ceil(total / queryResult.data.pageSize) || 1;

  res.status(200).json({
    success: true,
    data: { academicYears },
    meta: {
      page: queryResult.data.page,
      pageSize: queryResult.data.pageSize,
      total,
      totalPages
    },
    message: "Academic years retrieved successfully"
  });
});

// GET /api/v1/academic-years/current
academicYearsRouter.get("/current", async (_req: Request, res: Response) => {
  const academicYear = await AcademicService.getCurrentAcademicYear();
  if (!academicYear) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "No active academic year configured" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { academicYear },
    message: "Current academic year retrieved successfully"
  });
});

// POST /api/v1/academic-years (Admin only)
academicYearsRouter.post("/", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const parseResult = createAcademicYearSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid academic year data",
        details: parseResult.error.issues.map((e) => ({
          field: e.path.join("."),
          issue: e.message
        }))
      }
    });
    return;
  }

  const result = await AcademicService.createAcademicYear(parseResult.data, {
    user: req.user!,
    ip: req.ip,
    userAgent: req.get("user-agent")
  });

  if (result.error === "DUPLICATE_NAME") {
    res.status(409).json({
      success: false,
      error: { code: "DUPLICATE_NAME", message: "Academic year name already exists" }
    });
    return;
  }

  res.status(201).json({
    success: true,
    data: { academicYear: result.academicYear },
    message: "Academic year created successfully"
  });
});

// GET /api/v1/academic-years/:id
academicYearsRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const academicYear = await AcademicService.getAcademicYearById(id);

  if (!academicYear) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Academic year not found" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { academicYear },
    message: "Academic year retrieved successfully"
  });
});

// PUT /api/v1/academic-years/:id (Admin only)
academicYearsRouter.put("/:id", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const { id } = req.params;
  const parseResult = updateAcademicYearSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid academic year update data",
        details: parseResult.error.issues.map((e) => ({
          field: e.path.join("."),
          issue: e.message
        }))
      }
    });
    return;
  }

  const result = await AcademicService.updateAcademicYear(id, parseResult.data, {
    user: req.user!,
    ip: req.ip,
    userAgent: req.get("user-agent")
  });

  if (result.error === "NOT_FOUND") {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Academic year not found" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { academicYear: result.academicYear },
    message: "Academic year updated successfully"
  });
});

// PATCH /api/v1/academic-years/:id/set-current (Admin only)
academicYearsRouter.patch("/:id/set-current", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AcademicService.setCurrentAcademicYear(id, {
    user: req.user!,
    ip: req.ip,
    userAgent: req.get("user-agent")
  });

  if (result.error === "NOT_FOUND") {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Academic year not found" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { academicYear: result.academicYear },
    message: "Academic year set as current successfully"
  });
});

// GET /api/v1/academic-years/:yearId/semesters
academicYearsRouter.get("/:yearId/semesters", async (req: Request, res: Response) => {
  const { yearId } = req.params;
  const year = await AcademicService.getAcademicYearById(yearId);
  if (!year) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Academic year not found" }
    });
    return;
  }

  const semesters = await AcademicService.listSemesters(yearId);
  res.status(200).json({
    success: true,
    data: { semesters },
    message: "Semesters retrieved successfully"
  });
});

// POST /api/v1/academic-years/:yearId/semesters (Admin only)
academicYearsRouter.post("/:yearId/semesters", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const { yearId } = req.params;
  const parseResult = createSemesterSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid semester data",
        details: parseResult.error.issues.map((e) => ({
          field: e.path.join("."),
          issue: e.message
        }))
      }
    });
    return;
  }

  const result = await AcademicService.createSemester(yearId, parseResult.data, {
    user: req.user!,
    ip: req.ip,
    userAgent: req.get("user-agent")
  });

  if (result.error === "YEAR_NOT_FOUND") {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Academic year not found" }
    });
    return;
  }

  if (result.error === "DATE_OUT_OF_BOUNDS") {
    res.status(400).json({
      success: false,
      error: { code: "DATE_OUT_OF_BOUNDS", message: "Semester dates must fall within academic year dates" }
    });
    return;
  }

  if (result.error === "DUPLICATE_TERM") {
    res.status(409).json({
      success: false,
      error: { code: "DUPLICATE_TERM", message: "Term number already exists for this academic year" }
    });
    return;
  }

  res.status(201).json({
    success: true,
    data: { semester: result.semester },
    message: "Semester created successfully"
  });
});

// ================= SEMESTERS ROUTER =================
semestersRouter.use(requireAuth);

// GET /api/v1/semesters/:id
semestersRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const semester = await AcademicService.getSemesterById(id);

  if (!semester) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Semester not found" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { semester },
    message: "Semester retrieved successfully"
  });
});

// PUT /api/v1/semesters/:id (Admin only)
semestersRouter.put("/:id", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const { id } = req.params;
  const parseResult = updateSemesterSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid semester update data",
        details: parseResult.error.issues.map((e) => ({
          field: e.path.join("."),
          issue: e.message
        }))
      }
    });
    return;
  }

  const result = await AcademicService.updateSemester(id, parseResult.data, {
    user: req.user!,
    ip: req.ip,
    userAgent: req.get("user-agent")
  });

  if (result.error === "NOT_FOUND") {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Semester not found" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { semester: result.semester },
    message: "Semester updated successfully"
  });
});

// PATCH /api/v1/semesters/:id/activate (Admin only)
semestersRouter.patch("/:id/activate", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AcademicService.activateSemester(id, {
    user: req.user!,
    ip: req.ip,
    userAgent: req.get("user-agent")
  });

  if (result.error === "NOT_FOUND") {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Semester not found" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { semester: result.semester },
    message: "Semester activated successfully"
  });
});
