import { z } from "zod";

export const createAcademicYearSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
    isCurrent: z.boolean().optional().default(false)
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "Start date must be before end date",
    path: ["endDate"]
  });

export const updateAcademicYearSchema = z
  .object({
    name: z.string().min(2).max(50).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    isCurrent: z.boolean().optional(),
    isActive: z.boolean().optional()
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate);
      }
      return true;
    },
    {
      message: "Start date must be before end date",
      path: ["endDate"]
    }
  );

export const createSemesterSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    termNumber: z.coerce.number().int().min(1, "Term number must be at least 1"),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
    isActive: z.boolean().optional().default(false)
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "Start date must be before end date",
    path: ["endDate"]
  });

export const updateSemesterSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    termNumber: z.coerce.number().int().min(1).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    isActive: z.boolean().optional(),
    isClosed: z.boolean().optional()
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate);
      }
      return true;
    },
    {
      message: "Start date must be before end date",
      path: ["endDate"]
    }
  );

export const queryAcademicYearsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  isCurrent: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === "true"))
});

export type CreateAcademicYearInput = z.infer<typeof createAcademicYearSchema>;
export type UpdateAcademicYearInput = z.infer<typeof updateAcademicYearSchema>;
export type CreateSemesterInput = z.infer<typeof createSemesterSchema>;
export type UpdateSemesterInput = z.infer<typeof updateSemesterSchema>;
export type QueryAcademicYearsInput = z.infer<typeof queryAcademicYearsSchema>;
