# V2 Authentication: API Specification

## Endpoints

### 1. `POST /api/v1/auth/login`
Authenticates a user and issues an httpOnly session cookie.

- **URL:** `/api/v1/auth/login`
- **Method:** `POST`
- **Auth:** Public
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "admin@campuscore.edu",
    "password": "Admin@123456"
  }
  ```
- **Response Headers:** `Set-Cookie: campuscore_session=<token>; Path=/; HttpOnly; SameSite=Lax`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "1",
        "email": "admin@campuscore.edu",
        "firstName": "System",
        "lastName": "Administrator",
        "role": "SUPER_ADMIN",
        "isActive": true,
        "createdAt": "2026-11-22T08:00:00.000Z"
      }
    },
    "message": "Login successful"
  }
  ```
- **Response (401 Unauthorized):**
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_CREDENTIALS",
      "message": "Invalid email or password"
    }
  }
  ```

---

### 2. `POST /api/v1/auth/logout`
Destroys the active session and clears the session cookie.

- **URL:** `/api/v1/auth/logout`
- **Method:** `POST`
- **Auth:** Required (`campuscore_session` cookie or `Authorization: Bearer <token>`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": null,
    "message": "Logged out successfully"
  }
  ```

---

### 3. `GET /api/v1/auth/me`
Retrieves current authenticated session profile.

- **URL:** `/api/v1/auth/me`
- **Method:** `GET`
- **Auth:** Required
- **Response (200 OK):** Current `user` object.
- **Response (401 Unauthorized):** Session invalid or expired.
