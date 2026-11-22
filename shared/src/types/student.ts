export type StudentStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "GRADUATED" | "DROPPED";
export type StudentGender = "MALE" | "FEMALE" | "OTHER";
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export interface StudentDto {
  id: string;
  userId?: string | null;
  admissionNumber: string;
  rollNumber?: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string | null;
  dateOfBirth: string;
  gender: StudentGender;
  bloodGroup?: BloodGroup | null;
  departmentId: string;
  departmentName?: string;
  departmentCode?: string;
  courseId: string;
  courseName?: string;
  courseCode?: string;
  currentSemesterId: string;
  currentSemesterName?: string;
  admissionDate: string;
  status: StudentStatus;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentInput {
  userId?: string | null;
  admissionNumber?: string;
  rollNumber?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  dateOfBirth: string;
  gender?: StudentGender;
  bloodGroup?: BloodGroup | null;
  departmentId: string;
  courseId: string;
  currentSemesterId: string;
  admissionDate: string;
  status?: StudentStatus;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string;
}

export interface UpdateStudentInput {
  rollNumber?: string | null;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  dateOfBirth?: string;
  gender?: StudentGender;
  bloodGroup?: BloodGroup | null;
  departmentId?: string;
  courseId?: string;
  currentSemesterId?: string;
  admissionDate?: string;
  status?: StudentStatus;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string;
}

export interface QueryStudentsInput {
  page?: number;
  pageSize?: number;
  departmentId?: string;
  courseId?: string;
  semesterId?: string;
  status?: StudentStatus;
  q?: string;
}
