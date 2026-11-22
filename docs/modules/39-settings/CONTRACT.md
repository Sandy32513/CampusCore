# V39 System Settings: Module Contract

- **Module:** V39 System Settings
- **Status:** CONTRACT-FROZEN (Gate A Approved)
- **Date:** 2026-11-22
- **Lead Architect:** Antigravity Orchestrator

## 1. Scope
Deliver centralized institution profile, academic policies, localization, and technical governance:
- Institution Profile: Name, code, address, email, phone, website, logo URL.
- Localization & Regional: Default timezone (e.g. UTC, America/New_York), date format (`YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY`), time format (`12H`, `24H`), currency code & symbol.
- Academic Preferences: Academic year start month, grading scale reference, attendance threshold percentage (e.g. 75%).
- Security & Operations: Session timeout minutes, password expiry policy, registration toggle.
- Public vs Private separation: Exposes public institutional metadata for UI shells and login pages, and restricted operational parameters for Super Admins.
- Integration contract: Consumed by V1 Application Shell, V2 Auth, V15 Attendance, V20 Grades, V24 Fees, and V31 Reports.

## 2. API Specification
- `GET /api/v1/settings/public`: Unauthenticated / public endpoint returning institutional branding, name, timezone, and date format.
- `GET /api/v1/settings`: Authenticated endpoint returning all system configurations.
- `PUT /api/v1/settings`: Update settings (Strictly `SUPER_ADMIN` only). Emits V38 audit event.

## 3. Database Specification
- Table `system_settings`:
  - `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
  - `category` VARCHAR(50) NOT NULL DEFAULT 'GENERAL'
  - `setting_key` VARCHAR(100) NOT NULL UNIQUE
  - `setting_value` TEXT NOT NULL
  - `is_public` BOOLEAN NOT NULL DEFAULT FALSE
  - `description` VARCHAR(255) NULL
  - `created_at`, `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  - INDEX `idx_settings_category` (`category`)
  - INDEX `idx_settings_public` (`is_public`)
