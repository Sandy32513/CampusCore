# V4 — Student Management: Requirements

## Functional Requirements
- **FR-04-01**: The system must enforce unique institutional admission numbers and unique email addresses across all student records.
- **FR-04-02**: Every student must be linked to a valid Department (`departments.id`), Course (`courses.id`), and Current Semester (`semesters.id`).
- **FR-04-03**: Creation and modification of student records must be restricted to `SUPER_ADMIN` and `ADMIN` roles.
- **FR-04-04**: Deletion of student records must be restricted strictly to `SUPER_ADMIN`.
- **FR-04-05**: All student mutations must record immutable audit log entries in V38 (`audit_logs`).
- **FR-04-06**: Students must be queryable via pagination, substring search on name, admission number, roll number, or email, and filtered by department, course, semester, and status.

## Non-Functional Requirements
- **NFR-04-01**: Query latency on indexed filters must be under 50ms for up to 50,000 enrolled students.
- **NFR-04-02**: All demographic dates (`date_of_birth`, `admission_date`) must be validated against ISO 8601 (`YYYY-MM-DD`).
