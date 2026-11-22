# V10 Academic Year & Semester: Database Schema

## 1. Table: `academic_years`

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | BIGINT UNSIGNED | No | AUTO_INCREMENT | Primary Key |
| `name` | VARCHAR(50) | No | None | Unique Academic Year Label |
| `start_date` | DATE | No | None | Start date of academic cycle |
| `end_date` | DATE | No | None | End date of academic cycle |
| `is_current` | BOOLEAN | No | FALSE | Active institutional cycle flag |
| `is_active` | BOOLEAN | No | TRUE | Operational status flag |
| `created_at` | TIMESTAMP | No | CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | No | CURRENT_TIMESTAMP | Modification timestamp |

### Constraints
- `PRIMARY KEY (id)`
- `UNIQUE KEY uk_academic_years_name (name)`

## 2. Table: `semesters`

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | BIGINT UNSIGNED | No | AUTO_INCREMENT | Primary Key |
| `academic_year_id` | BIGINT UNSIGNED | No | None | Foreign Key referencing `academic_years.id` (RESTRICT) |
| `name` | VARCHAR(100) | No | None | Term / Semester Name |
| `term_number` | INT UNSIGNED | No | None | Ordinal sequence (1, 2, 3...) |
| `start_date` | DATE | No | None | Semester commencement date |
| `end_date` | DATE | No | None | Semester conclusion date |
| `is_active` | BOOLEAN | No | FALSE | Operational active semester flag |
| `is_closed` | BOOLEAN | No | FALSE | Historical locked status flag |
| `created_at` | TIMESTAMP | No | CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | No | CURRENT_TIMESTAMP | Modification timestamp |

### Constraints
- `PRIMARY KEY (id)`
- `FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE RESTRICT`
- `UNIQUE KEY uk_year_term (academic_year_id, term_number)`
