# V2 Authentication: Database Specification

## 1. Relational Tables

### 1.1 `users`
Primary authentication identity table:
- `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `email` VARCHAR(255) NOT NULL UNIQUE
- `password_hash` VARCHAR(255) NOT NULL
- `first_name` VARCHAR(100) NOT NULL
- `last_name` VARCHAR(100) NOT NULL
- `role` VARCHAR(50) NOT NULL DEFAULT 'STUDENT'
- `is_active` BOOLEAN NOT NULL DEFAULT TRUE
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

### 1.2 `sessions`
Revocable server-side active sessions:
- `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `user_id` BIGINT UNSIGNED NOT NULL, FOREIGN KEY -> `users(id)` ON DELETE CASCADE
- `token_hash` VARCHAR(64) NOT NULL UNIQUE (SHA-256 of raw session token)
- `ip_address` VARCHAR(45) NULL
- `user_agent` VARCHAR(255) NULL
- `expires_at` TIMESTAMP NOT NULL
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

## 2. Migrations
- `database/migrations/20261122010000_create_auth_tables.ts`
- Supports clean up and down rollback on MySQL 8.4 LTS.
