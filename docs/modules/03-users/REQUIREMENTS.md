# V3 User & Role Management: Requirements Document

## 1. Functional Requirements
- **FR-03-1:** Manage users: Create, list with pagination/search, view details, update, activate, and deactivate.
- **FR-03-2:** Maintain the 6 canonical system roles (`SUPER_ADMIN`, `ADMIN`, `TEACHER`, `STAFF`, `STUDENT`, `PARENT`).
- **FR-03-3:** Immediate session revocation when a user account is deactivated.
- **FR-03-4:** Prevent duplicate email registrations with standard 409 Conflict response.
- **FR-03-5:** Role-based access control middleware guarding endpoints by role and permission.
- **FR-03-6:** Admin-initiated password reset without email dependencies.
- **FR-03-7:** Provide `/api/v1/roles` and `/api/v1/permissions` discovery endpoints.

## 2. Non-Functional Requirements
- **NFR-03-1:** Deny-by-default authorization: Any user without explicit permission receives HTTP 403 Forbidden.
- **NFR-03-2:** User search query response time under 100ms.
- **NFR-03-3:** Password resets hashed with Argon2id/scrypt prior to storage.
