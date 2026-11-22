# V39 System Settings: Database Schema

## Table: `system_settings`

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | BIGINT UNSIGNED | No | AUTO_INCREMENT | Primary Key |
| `category` | VARCHAR(50) | No | 'GENERAL' | Setting Domain (INSTITUTION, LOCALIZATION, ACADEMIC, SECURITY) |
| `setting_key` | VARCHAR(100) | No | None | Unique key identifier |
| `setting_value` | TEXT | No | None | Value serialized as text |
| `is_public` | BOOLEAN | No | FALSE | Visibility flag for unauthenticated public endpoint |
| `description` | VARCHAR(255) | Yes | NULL | Human-readable explanation of setting parameter |
| `created_at` | TIMESTAMP | No | CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | No | CURRENT_TIMESTAMP | Modification timestamp |

### Indexes & Constraints
- `PRIMARY KEY (id)`
- `UNIQUE KEY uk_settings_key (setting_key)`
- `INDEX idx_settings_category (category)`
- `INDEX idx_settings_is_public (is_public)`
