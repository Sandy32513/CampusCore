import { z } from "zod";

export const SubjectTypeSchema = z.enum(["THEORY", "PRACTICAL", "LAB", "SEMINAR", "PROJECT"]);

export const CreateSubjectSchema = z.object({
  code: z.string().min(2, "Code must be at least 2 characters").max(50),
  name: z.string().min(2, "Subject name must be at least 2 characters").max(150),
  departmentId: z.string().min(1, "Department is required"),
  type: SubjectTypeSchema.default("THEORY"),
  credits: z.coerce.number().min(0).max(20).default(3),
  theoryCredits: z.coerce.number().min(0).max(20).default(3),
  practicalCredits: z.coerce.number().min(0).max(20).default(0),
  isElective: z.boolean().default(false),
  isActive: z.boolean().default(true),
  description: z.string().max(2000).optional().nullable()
});

export const UpdateSubjectSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  departmentId: z.string().min(1).optional(),
  type: SubjectTypeSchema.optional(),
  credits: z.coerce.number().min(0).max(20).optional(),
  theoryCredits: z.coerce.number().min(0).max(20).optional(),
  practicalCredits: z.coerce.number().min(0).max(20).optional(),
  isElective: z.boolean().optional(),
  isActive: z.boolean().optional(),
  description: z.string().max(2000).optional().nullable()
});

export const MapSubjectToCourseSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  semesterNumber: z.coerce.number().min(1).max(12).default(1),
  isMandatory: z.boolean().default(true)
});

export const QuerySubjectsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  departmentId: z.string().optional(),
  courseId: z.string().optional(),
  type: SubjectTypeSchema.optional(),
  isElective: z.coerce.boolean().optional(),
  status: z.enum(["active", "inactive", "all"]).default("all"),
  q: z.string().optional()
});
