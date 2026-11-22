# V2 Authentication: Module Contract

- **Module:** V2 Authentication
- **Status:** CONTRACT-FROZEN (Gate A Approved)
- **Date:** 2026-11-22
- **Lead Architect:** Antigravity Orchestrator

## 1. Scope
Deliver the core authentication system for CampusCore SMS:
- MySQL-backed user identity table (`users`) and server-side sessions table (`sessions`).
- Cryptographic password hashing using Argon2id.
- Server-side session management: Session token generated as cryptographically secure random 32-byte hex; stored in MySQL as SHA-256 hash.
- Transport via `httpOnly`, `SameSite=Lax`, `Secure` (production) cookie named `campuscore_session`.
- Session expiration: 8-hour maximum lifetime; 30-minute idle sliding window.
- Login rate-limiting to prevent credential brute-forcing.
- Authentication API endpoints:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/auth/me`
- Protected route middleware (`requireAuth`).
- Responsive frontend login view and user authentication status in shell header.
- Automated integration and security test suite.

## 2. API Specification

### 2.1 `POST /api/v1/auth/login`
- **Request Body:**
  ```json
  {
    "email": "admin@campuscore.edu",
    "password": "Password123!"
  }
  ```
- **Validation:** Zod schema requiring valid email format and minimum 8-character password.
- **Success (200 OK):**
  - Sets `campuscore_session` cookie (`httpOnly`, `Path=/`).
  - Response payload:
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "1",
          "email": "admin@campuscore.edu",
          "firstName": "System",
          "lastName": "Administrator",
          "role": "SUPER_ADMIN"
        }
      },
      "message": "Login successful"
    }
    ```
- **Error (401 Unauthorized):**
  - Returns generic message: `"Invalid email or password"` to prevent account enumeration.

### 2.2 `POST /api/v1/auth/logout`
- **Auth:** Requires active session.
- **Action:** Deletes session row from MySQL `sessions` table and clears cookie.
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "data": null,
    "message": "Logged out successfully"
  }
  ```

### 2.3 `GET /api/v1/auth/me`
- **Auth:** Requires active session cookie.
- **Success (200 OK):** Returns current user object.
- **Error (401 Unauthorized):** Session invalid or expired.

## 3. Database Specification
- **Engine:** MySQL 8.4 LTS, InnoDB, `utf8mb4_0900_ai_ci`.
- **Tables:**
  - `users`:
    - `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
    - `email` VARCHAR(255) NOT NULL UNIQUE
    - `password_hash` VARCHAR(255) NOT NULL
    - `first_name` VARCHAR(100) NOT NULL
    - `last_name` VARCHAR(100) NOT NULL
    - `role` VARCHAR(50) NOT NULL DEFAULT 'STUDENT'
    - `is_active` BOOLEAN NOT NULL DEFAULT TRUE
    - `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    - `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
  - `sessions`:
    - `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
    - `user_id` BIGINT UNSIGNED NOT NULL, FOREIGN KEY -> `users(id)` ON DELETE CASCADE
    - `token_hash` VARCHAR(64) NOT NULL UNIQUE (SHA-256 of raw session token)
    - `ip_address` VARCHAR(45) NULL
    - `user_agent` VARCHAR(255) NULL
    - `expires_at` DATETIME(3) NOT NULL
    - `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    - INDEX on `token_hash`, INDEX on `user_id`, INDEX on `expires_at`

## 4. UI Specification
- Header user profile shows "Sign In" when unauthenticated, and user name + role badge + "Logout" button when authenticated.
- Modal / standalone Login Dialog with email, password, loading spinner, and clear error notifications.
