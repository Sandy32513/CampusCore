# ADR-001: Academic Entity Precedence and Student Ordering

- **Status:** Proposed (Gate 0)
- **Date:** 2026-11-22
- **Author:** Orchestrator Lead Agent
- **Target:** CampusCore (SMS-2026-001)

## Context
The numeric roadmap in the Master Plan (§7) lists:
- `V4`: Student Management
- `V7`: Department Management
- `V8`: Course Management
- `V10`: Academic Year & Semester

However, the functional and database requirements for `V4` (Student Management, TRD §5.2, PRD §7.2) require the following fields for every student record:
- `department_id` (foreign key pointing to Department)
- `course_id` (foreign key pointing to Course)
- `semester_id` (foreign key pointing to Semester / Academic Year)

Under **Hard Rule §62 & §76**:
- Every module must ship fully validated with true database constraints (no fake/placeholder functionality).
- Once a module is **FROZEN**, it is read-only. Frozen modules cannot be reopened or patched without formal change requests.

## Options Considered

### Option 1 (Recommended): Build V7, V10, V8 Before V4
Schedule the core academic structure before `V4`:
1. Wave 5: Build `V7` (Department), `V10` (Academic Year & Semester), and `V38` (Audit Logs).
2. Wave 6: Build `V8` (Course Management, mapped to Department).
3. Wave 7: Build `V4` (Student Management).

- **Pros:**
  - Foreign key constraints (`department_id`, `course_id`, `semester_id`) are enforced at the database level with `ON DELETE RESTRICT` from day one.
  - Realistic seed data and relational integrity tests run immediately.
  - V4 is frozen once and remains completely clean and immutable. Zero patch migrations required later.
- **Cons:**
  - The build sequence diverges from pure numeric order (V7, V10, V8 precede V4).

### Option 2 (Alternative): Follow Strict Numeric Order with Post-Hoc Patching
Build V4 first with unconstrained columns:
- `department_id`, `course_id`, `semester_id` are created as nullable, unconstrained integer/string columns or mock placeholders.
- When V7, V8, and V10 are subsequently built, a migration script is generated and V4 must be reopened via a formal Change Request (`CR-xxx`) to add foreign keys, update UI selectors, and re-run full regression tests.

- **Pros:**
  - Strictly follows numeric sequence V0 -> V1 -> V2 -> V3 -> V4...
- **Cons:**
  - Directly violates the principle that frozen modules are read-only.
  - Introduces risk of orphaned/invalid student data.
  - Creates rework, extra regression cycles, and tech debt.

## Decision
**Adopt Option 1 (Recommended).**
We build `V7` (Department Management), `V10` (Academic Year & Semester), and `V8` (Course Management) before `V4` (Student Management). When `V4` is developed in Wave 7, its dependencies are 100% frozen, allowing pure relational integrity in MySQL.
