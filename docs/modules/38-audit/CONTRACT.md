# V38 Audit Logs: Module Contract

- **Module:** V38 Audit Logs
- **Status:** CONTRACT-FROZEN (Gate A Approved)
- **Date:** 2026-11-22
- **Lead Architect:** Antigravity Orchestrator

## 1. Scope
Deliver universal tamper-evident event auditing across the entire SMS:
- Centralized audit logging service `AuditService.logEvent(payload)` for synchronous and transaction-safe audit persistence.
- Captures actor identity (user ID, email, role), action verb, entity type, entity ID, metadata details, IP address, user agent, timestamp, and operation status (`SUCCESS`, `FAILURE`, `WARNING`).
- Strictly append-only: No update (`PUT`/`PATCH`) and no delete (`DELETE`) endpoints are exposed.
- Admin inquiry interface: Queryable by date range, actor, action, entity, status, with pagination and keyword search.
- Integration contract: Consumed by every module in the SMS (V2 Auth, V3 Users, V7 Departments, V10 Academic, etc.) as the official system of record for auditability.

## 2. API Specification
- `GET /api/v1/audit-logs`: Query params `page`, `pageSize`, `userId`, `action`, `entity`, `status`, `startDate`, `endDate`, `q`. Only accessible by `SUPER_ADMIN` and `ADMIN`.
- `GET /api/v1/audit-logs/:id`: Fetch specific audit log entry by ID including detailed metadata payload.

## 3. Database Specification
- Table `audit_logs`:
  - `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
  - `user_id` BIGINT UNSIGNED NULL (FK `users.id` ON DELETE SET NULL)
  - `user_email` VARCHAR(255) NULL
  - `role` VARCHAR(50) NULL
  - `action` VARCHAR(100) NOT NULL
  - `entity` VARCHAR(100) NOT NULL
  - `entity_id` VARCHAR(100) NULL
  - `details` JSON NULL
  - `ip_address` VARCHAR(45) NULL
  - `user_agent` VARCHAR(255) NULL
  - `status` ENUM('SUCCESS', 'FAILURE', 'WARNING') NOT NULL DEFAULT 'SUCCESS'
  - `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  - INDEX `idx_audit_created` (`created_at`)
  - INDEX `idx_audit_user` (`user_id`)
  - INDEX `idx_audit_action_entity` (`action`, `entity`)
