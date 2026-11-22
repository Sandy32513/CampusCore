# V8 Course Management: Database Schema

## Table: `courses`

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | BIGINT UNSIGNED | No | AUTO_INCREMENT | Primary Key |
| `department_id` | BIGINT UNSIGNED | No | None | Foreign Key referencing `departments.id` (RESTRICT) |
| `code` | VARCHAR(50) | No | None | Unique Course Code (uppercase) |
| `name` | VARCHAR(150) | No | None | Official Course Name |
| `description` | TEXT | Yes | NULL | Program Summary / Objectives |
| `degree_level` | VARCHAR(30) | No | 'UNDERGRADUATE' | Degree Level Classification |
| `duration_years` | DECIMAL(3,1) | No | 4.0 | Duration in academic years |
| `total_credits` | INT UNSIGNED | No | 120 | Total completion credits |
| `is_active` | BOOLEAN | No | TRUE | Operational status flag |
| `created_at` | TIMESTAMP | No | CURRENT_TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | No | CURRENT_TIMESTAMP | Last modification timestamp |

### Indexes & Constraints
- `PRIMARY KEY (id)`
- `FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT`
- `UNIQUE KEY uk_courses_code (code)`
- `INDEX idx_courses_department_id (department_id)`
