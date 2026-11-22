# V7 Department Management: Module Contract

- **Module:** V7 Department Management
- **Status:** CONTRACT-FROZEN (Gate A Approved)
- **Date:** 2026-11-22
- **Lead Architect:** Antigravity Orchestrator

## 1. Scope
Deliver the foundational academic Department entity:
- Create, update, list (paginated, sorted, searched), and toggle department status.
- Unique department code (normalized to uppercase, e.g. "CSE", "ECE", "MECH").
- Assign Head of Department (HOD).
- Department statistics: associated courses count, faculty count, student count.
- Deactivation safeguard: Department cannot be deactivated if active dependencies exist.
- Integration contract: Exposes `department_id` primary key for V8 (Course) and V4 (Student).

## 2. API Specification
- `GET /api/v1/departments`: Query params `page`, `pageSize`, `q`, `status`.
- `POST /api/v1/departments`: Body `{ code, name, description?, headOfDepartment? }`. Returns 201 Created.
- `GET /api/v1/departments/:id`: Returns department details and statistics.
- `PUT /api/v1/departments/:id`: Update details.
- `PATCH /api/v1/departments/:id/status`: Toggle active status.

## 3. Database Specification
- Table `departments`:
  - `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
  - `code` VARCHAR(50) NOT NULL UNIQUE
  - `name` VARCHAR(150) NOT NULL
  - `description` TEXT NULL
  - `head_of_department` VARCHAR(150) NULL
  - `is_active` BOOLEAN NOT NULL DEFAULT TRUE
  - `created_at`, `updated_at` TIMESTAMP
