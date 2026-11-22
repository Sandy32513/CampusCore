# V3 User & Role Management: Database Specification

## 1. Schema Tables

### 1.1 `roles`
- `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `name` VARCHAR(50) NOT NULL UNIQUE
- `description` VARCHAR(255) NOT NULL
- `is_system` BOOLEAN NOT NULL DEFAULT TRUE
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 1.2 `permissions`
- `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `resource` VARCHAR(50) NOT NULL
- `action` VARCHAR(50) NOT NULL
- `description` VARCHAR(255) NOT NULL
- UNIQUE (`resource`, `action`)

### 1.3 `role_permissions`
- `role_id` INT UNSIGNED NOT NULL, FK -> `roles(id)` ON DELETE CASCADE
- `permission_id` INT UNSIGNED NOT NULL, FK -> `permissions(id)` ON DELETE CASCADE
- PRIMARY KEY (`role_id`, `permission_id`)

## 2. Seed Data
Pre-populates the 6 system roles:
1. `SUPER_ADMIN`
2. `ADMIN`
3. `TEACHER`
4. `STAFF`
5. `STUDENT`
6. `PARENT`
