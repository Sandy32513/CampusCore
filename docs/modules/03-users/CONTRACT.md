# V3 User & Role Management: Module Contract

- **Module:** V3 User & Role Management
- **Status:** CONTRACT-FROZEN (Gate A Approved)
- **Date:** 2026-11-22
- **Lead Architect:** Antigravity Orchestrator

## 1. Scope
Deliver the complete user administration and role-based access control (RBAC) foundation:
- 6 Canonical System Roles:
  - `SUPER_ADMIN` (Full system access)
  - `ADMIN` (Academic, student, and finance operations)
  - `TEACHER` (Assigned classes, subjects, attendance, marks)
  - `STAFF` (Designated operational modules)
  - `STUDENT` (Self-service access to own records)
  - `PARENT` (Read-only access to linked children)
- User CRUD: Create, read (paginated/filtered/searched), update, activate, and deactivate.
- Immediate Revocation: Deactivating a user instantly deletes all active MySQL sessions, preventing further actions on their very next request.
- Admin-Initiated Password Reset: Generates a temporary compliant password or sets a reset token.
- Permission Registry & Authorization Middleware (`requireRole`, `requirePermission`).
- Relational tables: `roles`, `permissions`, and `role_permissions`.
- Integration and authorization matrix tests verifying role boundaries.

## 2. API Specification

### 2.1 `GET /api/v1/users`
- **Auth:** Requires `SUPER_ADMIN` or `ADMIN`.
- **Query Params:** `page` (default 1), `pageSize` (default 20), `role` (optional), `q` (search name or email).
- **Response Format:**
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
    "meta": { "page": 1, "pageSize": 20, "total": 1, "totalPages": 1 },
    "message": "Users retrieved successfully"
  }
  ```

### 2.2 `POST /api/v1/users`
- **Auth:** Requires `SUPER_ADMIN` or `ADMIN`.
- **Request Body:** `{ email, password, firstName, lastName, role }`
- **Success (201 Created):** Returns created user (excluding password hash).
- **Error (409 Conflict):** If email is already registered.

### 2.3 `GET /api/v1/users/:id`
- **Auth:** Requires `SUPER_ADMIN` or `ADMIN`, or self (`user.id === id`).
- **Success (200 OK):** Returns detailed user record with permissions.

### 2.4 `PUT /api/v1/users/:id`
- **Auth:** Requires `SUPER_ADMIN` or `ADMIN`.
- **Request Body:** `{ firstName?, lastName?, role?, email? }`
- **Success (200 OK):** Returns updated user record.

### 2.5 `PATCH /api/v1/users/:id/status`
- **Auth:** Requires `SUPER_ADMIN`.
- **Request Body:** `{ isActive: boolean }`
- **Action:** Updates `users.is_active`. If `isActive === false`, deletes all rows in `sessions` where `user_id = id`.
- **Success (200 OK):** Returns updated user record.

### 2.6 `GET /api/v1/roles` & `GET /api/v1/permissions`
- **Auth:** Authenticated users.
- **Success (200 OK):** Lists all system roles and their assigned permissions.

## 3. Database Specification
- **Tables:**
  - `roles`: `id`, `name` (unique), `description`, `is_system`, `created_at`.
  - `permissions`: `id`, `resource`, `action`, `description`.
  - `role_permissions`: `role_id` (FK -> `roles.id`), `permission_id` (FK -> `permissions.id`), composite PK (`role_id`, `permission_id`).
