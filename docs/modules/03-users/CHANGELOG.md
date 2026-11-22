# V3 User & Role Management: Changelog

## [3.0.0] - 2026-11-22
### Added
- 6 Canonical System Roles (`SUPER_ADMIN`, `ADMIN`, `TEACHER`, `STAFF`, `STUDENT`, `PARENT`).
- System permissions registry with 19 core permissions.
- Role-based authorization middleware (`requireRole`).
- User administration CRUD endpoints with pagination, role filtering, and search.
- Instant session revocation on user deactivation.
- Admin-initiated password reset functionality.
- Database migration `20261122020000_create_roles_permissions.ts`.
- Comprehensive integration test suite verifying 9 RBAC and management test cases.
- All 8 standard documentation files in `docs/modules/03-users/`.
