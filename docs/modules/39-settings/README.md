# V39 — System Settings

## Module Overview
System Settings delivers centralized institutional governance, regional localization, academic policy constants, and operational parameters:
- Institution Profile: Official institutional name, code, contact email, phone, physical address, and logo.
- Localization: Unified system timezone, date formats (`YYYY-MM-DD`), time formats (`24H`), and currency symbols.
- Academic Thresholds: Attendance percentage requirements (e.g. 75%) and grading scale references.
- Security Policies: Session expiration limits and student self-registration toggles.
- Role-gated administration: Only `SUPER_ADMIN` can mutate system configuration.
- Full audit event logging via V38.

## Direct Dependencies
- **Upstream:** V0 Foundation, V2 Authentication, V3 User Management, V38 Audit Logs.
- **Downstream:** Consumed universally across UI shells, reports, fee modules, attendance policies, and grade computations.

## API Summary
- `GET /api/v1/settings/public`: Publicly accessible configuration metadata.
- `GET /api/v1/settings`: Full settings map for authenticated users.
- `PUT /api/v1/settings`: Update settings (`SUPER_ADMIN` only).

## Verification
Integration tests in `backend/tests/settings.test.ts`.
Status: **FROZEN** (`v39.0.0-system-settings`).
