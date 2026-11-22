export type SubjectType = "THEORY" | "PRACTICAL" | "LAB" | "SEMINAR" | "PROJECT";

export interface SubjectDto {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  departmentName?: string;
  departmentCode?: string;
  type: SubjectType;
  credits: number;
  theoryCredits: number;
  practicalCredits: number;
  isElective: boolean;
  isActive: boolean;
  description?: string | null;
  courses?: CourseSubjectMappingDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseSubjectMappingDto {
  id: string;
  courseId: string;
  courseName?: string;
  courseCode?: string;
  subjectId: string;
  semesterNumber: number;
  isMandatory: boolean;
  createdAt: string;
}

export interface CreateSubjectInput {
  code: string;
  name: string;
  departmentId: string;
  type?: SubjectType;
  credits?: number;
  theoryCredits?: number;
  practicalCredits?: number;
  isElective?: boolean;
  isActive?: boolean;
  description?: string | null;
}

export interface UpdateSubjectInput {
  name?: string;
  departmentId?: string;
  type?: SubjectType;
  credits?: number;
  theoryCredits?: number;
  practicalCredits?: number;
  isElective?: boolean;
  isActive?: boolean;
  description?: string | null;
}

export interface MapSubjectToCourseInput {
  courseId: string;
  semesterNumber: number;
  isMandatory?: boolean;
}

export interface QuerySubjectsInput {
  page?: number;
  pageSize?: number;
  departmentId?: string;
  courseId?: string;
  type?: SubjectType;
  isElective?: boolean;
  status?: "active" | "inactive" | "all";
  q?: string;
}
