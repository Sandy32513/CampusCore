# V38 Audit Logs: Database Schema

## Table: `audit_logs`

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | BIGINT UNSIGNED | No | AUTO_INCREMENT | Primary Key |
| `user_id` | BIGINT UNSIGNED | Yes | NULL | Actor user ID (FK `users.id` ON DELETE SET NULL) |
| `user_email` | VARCHAR(255) | Yes | NULL | Actor email snapshot |
| `role` | VARCHAR(50) | Yes | NULL | Actor role at time of event |
| `action` | VARCHAR(100) | No | None | Action verb (e.g., `DEPARTMENT_CREATE`, `USER_LOGIN`) |
| `entity` | VARCHAR(100) | No | None | Target entity name (e.g., `DEPARTMENT`, `USER`, `ACADEMIC_YEAR`) |
| `entity_id` | VARCHAR(100) | Yes | NULL | Target primary key / identifier |
| `details` | JSON | Yes | NULL | Structured JSON change diff or event payload |
| `ip_address` | VARCHAR(45) | Yes | NULL | Client IP address (IPv4/IPv6) |
| `user_agent` | VARCHAR(255) | Yes | NULL | Client HTTP User-Agent header |
| `status` | ENUM('SUCCESS', 'FAILURE', 'WARNING') | No | 'SUCCESS' | Outcome status |
| `created_at` | TIMESTAMP | No | CURRENT_TIMESTAMP | Event occurrence timestamp |

### Indexes & Constraints
- `PRIMARY KEY (id)`
- `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL`
- `INDEX idx_audit_created_at (created_at)`
- `INDEX idx_audit_user_id (user_id)`
- `INDEX idx_audit_action_entity (action, entity)`
