# V8 Course Management: Module Contract

- **Module:** V8 Course Management
- **Status:** CONTRACT-FROZEN (Gate A Approved)
- **Date:** 2026-11-22
- **Lead Architect:** Antigravity Orchestrator

## 1. Scope
Deliver academic degree and program management:
- Course definition: code (uppercase unique e.g. `CS101`, `BTECH-CSE`), name, degree level (`UNDERGRADUATE`, `POSTGRADUATE`, `DIPLOMA`, `CERTIFICATE`), duration in years/semesters.
- Department mapping: Required foreign key `department_id` referencing `departments.id` (`ON DELETE RESTRICT`).
- Course status management (`is_active`).
- Relational aggregation: enrolled student counts, assigned teachers, subject count.
- Downstream relational anchor: Exposes `course_id` primary key for V4 (Student Lifecycle), V9 (Subject Management), V11 (Class/Section), V14 (Enrollment), V24 (Fees).

## 2. API Specification
- `GET /api/v1/courses`: Query params `page`, `pageSize`, `departmentId`, `status`, `degreeLevel`, `q`.
- `POST /api/v1/courses`: Body `{ code, name, departmentId, degreeLevel?, durationYears, totalCredits?, description? }`. Returns 201 Created.
- `GET /api/v1/courses/:id`: Returns course details with department entity and statistics.
- `PUT /api/v1/courses/:id`: Update details.
- `PATCH /api/v1/courses/:id/status`: Toggle active status.

## 3. Database Specification
- Table `courses`:
  - `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
  - `department_id` BIGINT UNSIGNED NOT NULL (FK `departments.id` ON DELETE RESTRICT)
  - `code` VARCHAR(50) NOT NULL UNIQUE
  - `name` VARCHAR(150) NOT NULL
  - `description` TEXT NULL
  - `degree_level` ENUM('UNDERGRADUATE', 'POSTGRADUATE', 'DIPLOMA', 'CERTIFICATE') NOT NULL DEFAULT 'UNDERGRADUATE'
  - `duration_years` DECIMAL(3,1) NOT NULL DEFAULT 4.0
  - `total_credits` INT UNSIGNED NOT NULL DEFAULT 120
  - `is_active` BOOLEAN NOT NULL DEFAULT TRUE
  - `created_at`, `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  - INDEX `idx_courses_department` (`department_id`)
  - UNIQUE KEY `uk_courses_code` (`code`)
