# V4 — Student Management

## Module Overview
Student Management governs student identity, admissions, institutional enrollment, academic progress, and demographics:
- Unique Admission Number (`ADM...`) and Roll Number tracking.
- Strict relational constraints linking student records to Department (`V7`), Program/Course (`V8`), and Active Semester (`V10`).
- User account association (`users.id` foreign key with `SET NULL` on delete).
- Demographic, contact, emergency contact, and postal address tracking.
- Status lifecycle (`ACTIVE`, `INACTIVE`, `SUSPENDED`, `GRADUATED`, `DROPPED`).
- Audit logging for all administrative actions via V38 (`STUDENT_CREATE`, `STUDENT_UPDATE`, `STUDENT_DELETE`).

## Direct Dependencies
- **Upstream:** V0 Foundation, V2 Authentication, V3 Users & Roles, V7 Departments, V8 Courses, V10 Academic Calendar.
- **Downstream:** V5 Student Profile, V6 Guardians, V11 Classes & Sections, V14 Enrollment, V23 Documents, V24 Fees.

## API Summary
- `GET /api/v1/students`: Paginated search and filtering by department, course, semester, status.
- `POST /api/v1/students`: Admit new student (`SUPER_ADMIN`, `ADMIN`).
- `GET /api/v1/students/:id`: Detailed student record with joined academic entities.
- `PUT /api/v1/students/:id`: Update student record (`SUPER_ADMIN`, `ADMIN`).
- `PATCH /api/v1/students/:id/status`: Toggle status lifecycle (`SUPER_ADMIN`, `ADMIN`).
- `DELETE /api/v1/students/:id`: Remove student record (`SUPER_ADMIN`).

## Status
Status: **FROZEN** (`v4.0.0-students`).
