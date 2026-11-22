export interface CourseDto {
  id: string;
  departmentId: string;
  departmentName?: string;
  departmentCode?: string;
  code: string;
  name: string;
  description?: string | null;
  degreeLevel: "UNDERGRADUATE" | "POSTGRADUATE" | "DIPLOMA" | "CERTIFICATE";
  durationYears: number;
  totalCredits: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: {
    studentCount: number;
    teacherCount: number;
    subjectCount: number;
  };
}
