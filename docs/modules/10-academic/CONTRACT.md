# V10 Academic Year & Semester: Module Contract

- **Module:** V10 Academic Year & Semester Management
- **Status:** CONTRACT-FROZEN (Gate A Approved)
- **Date:** 2026-11-22
- **Lead Architect:** Antigravity Orchestrator

## 1. Scope
Deliver institutional academic calendar governance:
- Academic Year management: define institutional cycle (e.g., 2026-2027), start/end dates, and toggle current year.
- Semester / Term management: partition academic year into terms (e.g., Fall 2026, Spring 2027), term number, dates.
- Active Semester governance: flag the operational semester for enrollment, attendance, and grading.
- Historical Semester locking: prevent modifications to concluded terms.
- Downstream relational anchor: Exposes `academic_year_id` and `semester_id` for V4 (Student), V8 (Course), V11 (Class/Section), V14 (Enrollment), V15 (Attendance), and V22 (Examinations).

## 2. API Specification
- `GET /api/v1/academic-years`: List academic years with nested semester summaries. Query params: `page`, `pageSize`, `isCurrent`.
- `POST /api/v1/academic-years`: Body `{ name, startDate, endDate, isCurrent? }`. Returns 201 Created.
- `GET /api/v1/academic-years/current`: Fetch current active academic year and active semester.
- `GET /api/v1/academic-years/:id`: Fetch academic year details with full semester list.
- `PUT /api/v1/academic-years/:id`: Update academic year metadata.
- `PATCH /api/v1/academic-years/:id/set-current`: Atomically set target year as current.
- `GET /api/v1/academic-years/:yearId/semesters`: List semesters for academic year.
- `POST /api/v1/academic-years/:yearId/semesters`: Create semester `{ name, termNumber, startDate, endDate, isActive? }`.
- `GET /api/v1/semesters/:id`: Fetch semester details.
- `PUT /api/v1/semesters/:id`: Update semester dates and title.
- `PATCH /api/v1/semesters/:id/activate`: Atomically activate semester for current operations.

## 3. Database Specification
- Table `academic_years`:
  - `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
  - `name` VARCHAR(50) NOT NULL UNIQUE
  - `start_date` DATE NOT NULL
  - `end_date` DATE NOT NULL
  - `is_current` BOOLEAN NOT NULL DEFAULT FALSE
  - `is_active` BOOLEAN NOT NULL DEFAULT TRUE
  - `created_at`, `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
- Table `semesters`:
  - `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
  - `academic_year_id` BIGINT UNSIGNED NOT NULL (FK `academic_years.id` ON DELETE RESTRICT)
  - `name` VARCHAR(100) NOT NULL
  - `term_number` INT UNSIGNED NOT NULL
  - `start_date` DATE NOT NULL
  - `end_date` DATE NOT NULL
  - `is_active` BOOLEAN NOT NULL DEFAULT FALSE
  - `is_closed` BOOLEAN NOT NULL DEFAULT FALSE
  - `created_at`, `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  - UNIQUE KEY `uk_year_term` (`academic_year_id`, `term_number`)
