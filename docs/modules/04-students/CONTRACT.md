# V4 — Student Management: Contract

## TypeScript Interfaces (`@campuscore/shared`)

```typescript
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
```
