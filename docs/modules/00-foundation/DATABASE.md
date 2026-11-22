# V0 Foundation: Database Specification

## 1. Engine & Configuration
- **Database Engine:** MySQL Community Edition 8.4 LTS
- **Charset & Collation:** `utf8mb4` / `utf8mb4_0900_ai_ci`
- **Storage Engine:** InnoDB
- **Isolation Level:** REPEATABLE READ
- **Connection Driver:** `mysql2` (via Knex.js query builder)

## 2. Baseline Schema
In V0, the database connection is validated using `SELECT 1 AS health`.
Initial migration `20261122000000_init_foundation.ts` prepares:
- `system_metadata` (`key` VARCHAR(100) PRIMARY KEY, `value` VARCHAR(255) NOT NULL, `updated_at` TIMESTAMP)
- Knex migrations tracking table (`knex_migrations`)
