import { z } from "zod";

export const StudentStatusSchema = z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "GRADUATED", "DROPPED"]);
export const StudentGenderSchema = z.enum(["MALE", "FEMALE", "OTHER"]);
export const BloodGroupSchema = z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);

export const CreateStudentSchema = z.object({
  userId: z.string().optional().nullable(),
  admissionNumber: z.string().min(3).max(50).optional(),
  rollNumber: z.string().max(50).optional().nullable(),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid student email address").max(255),
  phone: z.string().max(30).optional().nullable(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
  gender: StudentGenderSchema.default("OTHER"),
  bloodGroup: BloodGroupSchema.optional().nullable(),
  departmentId: z.string().min(1, "Department is required"),
  courseId: z.string().min(1, "Course is required"),
  currentSemesterId: z.string().min(1, "Semester is required"),
  admissionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
  status: StudentStatusSchema.default("ACTIVE"),
  emergencyContactName: z.string().max(100).optional().nullable(),
  emergencyContactPhone: z.string().max(30).optional().nullable(),
  addressLine1: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  country: z.string().max(100).default("USA")
});

export const UpdateStudentSchema = z.object({
  rollNumber: z.string().max(50).optional().nullable(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(30).optional().nullable(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  gender: StudentGenderSchema.optional(),
  bloodGroup: BloodGroupSchema.optional().nullable(),
  departmentId: z.string().min(1).optional(),
  courseId: z.string().min(1).optional(),
  currentSemesterId: z.string().min(1).optional(),
  admissionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: StudentStatusSchema.optional(),
  emergencyContactName: z.string().max(100).optional().nullable(),
  emergencyContactPhone: z.string().max(30).optional().nullable(),
  addressLine1: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  country: z.string().max(100).optional()
});

export const QueryStudentsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  departmentId: z.string().optional(),
  courseId: z.string().optional(),
  semesterId: z.string().optional(),
  status: StudentStatusSchema.optional(),
  q: z.string().optional()
});
