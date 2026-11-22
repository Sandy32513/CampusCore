# V7 Department Management: Database Schema

## Table: `departments`

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | BIGINT UNSIGNED | No | AUTO_INCREMENT | Primary Key |
| `code` | VARCHAR(50) | No | None | Unique Department Code (uppercase) |
| `name` | VARCHAR(150) | No | None | Department Display Name |
| `description` | TEXT | Yes | NULL | Department Purpose / Summary |
| `head_of_department` | VARCHAR(150) | Yes | NULL | Faculty / HOD Name |
| `is_active` | BOOLEAN | No | TRUE | Operational Status Flag |
| `created_at` | TIMESTAMP | No | CURRENT_TIMESTAMP | Record Creation Time |
| `updated_at` | TIMESTAMP | No | CURRENT_TIMESTAMP | Last Mutation Time |

### Indexes & Constraints
- `PRIMARY KEY (id)`
- `UNIQUE KEY uk_departments_code (code)`
