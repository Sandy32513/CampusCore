# V9 — Subject Management: Contract

## TypeScript Interfaces (`@campuscore/shared`)

```typescript
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
```
