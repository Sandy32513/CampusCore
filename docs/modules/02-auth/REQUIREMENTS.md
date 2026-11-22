# V2 Authentication: Requirements Document

## 1. Functional Requirements
- **FR-02-1:** Authenticate users via email and password credentials.
- **FR-02-2:** Passwords hashed with Argon2id prior to database storage.
- **FR-02-3:** Revocable server-side session stored in MySQL `sessions` table.
- **FR-02-4:** Transport session token via secure, `httpOnly`, `SameSite=Lax` cookies.
- **FR-02-5:** Provide `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, and `GET /api/v1/auth/me`.
- **FR-02-6:** Provide `requireAuth` route middleware to guard authenticated endpoints.
- **FR-02-7:** Seed default administrator account for development and testing.

## 2. Non-Functional Requirements
- **NFR-02-1:** Password hash verification executed in under 300ms.
- **NFR-02-2:** Login error messages must not distinguish between non-existent accounts and invalid passwords.
- **NFR-02-3:** Zero plaintext password logging across all middleware and Pino loggers.
- **NFR-02-4:** Rate limiting blocks abusive requests after 5 consecutive failures per IP.
