# V2 Authentication: Changelog

## [2.0.0] - 2026-11-22
### Added
- Cryptographic password hashing and timing-safe verification.
- Server-side session management stored in MySQL (`sessions` table).
- Secure cookie transport (`httpOnly`, `SameSite=Lax`).
- API endpoints `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, and `GET /api/v1/auth/me`.
- Route authentication guard middleware (`requireAuth`).
- Database migration `20261122010000_create_auth_tables.ts`.
- Default administrator bootstrap user.
- Integration test suite with 6 comprehensive security and lifecycle test cases.
- All 8 standard documentation files in `docs/modules/02-auth/`.
