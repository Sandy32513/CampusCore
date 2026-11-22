export interface DepartmentDto {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  headOfDepartment?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: {
    courseCount: number;
    facultyCount: number;
    studentCount: number;
  };
}
