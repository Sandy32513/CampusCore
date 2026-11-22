# V3 User & Role Management: API Specification

## 1. Endpoints

### 1.1 `GET /api/v1/users`
Lists users with pagination, role filtering, and text search.
- **Auth:** Requires `SUPER_ADMIN` or `ADMIN`.
- **Query Params:** `page` (number, default 1), `pageSize` (number, default 20), `role` (optional), `q` (search string).
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "1",
        "email": "admin@campuscore.edu",
        "firstName": "System",
        "lastName": "Administrator",
        "role": "SUPER_ADMIN",
        "isActive": true,
        "createdAt": "2026-11-22T08:00:00.000Z"
      }
    ]
  },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1
  },
  "message": "Users retrieved successfully"
}
```

### 1.2 `POST /api/v1/users`
Creates a new user record.
- **Auth:** Requires `SUPER_ADMIN` or `ADMIN`.
- **Request Body:** `{ email, password, firstName, lastName, role }`
- **Response (201 Created):** Created user object (excluding password hash).
- **Response (409 Conflict):** Email already exists.

### 1.3 `PUT /api/v1/users/:id`
Updates user details.
- **Auth:** Requires `SUPER_ADMIN` or `ADMIN`.
- **Request Body:** `{ firstName?, lastName?, role?, email? }`

### 1.4 `PATCH /api/v1/users/:id/status`
Activates or deactivates a user.
- **Auth:** Requires `SUPER_ADMIN`.
- **Request Body:** `{ isActive: boolean }`
- **Behavior:** Deactivation immediately revokes all active sessions for the user. Self-deactivation by the requesting administrator returns `400 Bad Request`.

### 1.5 `POST /api/v1/users/:id/reset-password`
Admin-initiated password reset.
- **Auth:** Requires `SUPER_ADMIN` or `ADMIN`.
- **Response (200 OK):** Returns generated temporary password; revokes user's active sessions.

### 1.6 `GET /api/v1/roles` & `GET /api/v1/permissions`
Lists all 6 system roles and defined permissions.
- **Auth:** Requires authenticated session.
