# V3 User & Role Management: Security & Threat Model

## 1. Threat Modeling (STRIDE)

| Threat | Target | Mitigation |
|---|---|---|
| **Privilege Escalation** | `POST /users`, `PUT /users/:id` | Only `SUPER_ADMIN` can assign or change `role` to `SUPER_ADMIN` or `ADMIN`. `ADMIN` users cannot grant higher privileges than their own. |
| **Bypassing Inactivation** | Deactivated User Session | Deactivating a user account triggers an immediate transactional deletion of all active sessions for that `user_id`. The user's next HTTP request returns 401/403. |
| **Self-Lockout** | `PATCH /users/:id/status` | System prevents a `SUPER_ADMIN` from deactivating their own active account. |
| **Email Hijacking** | `PUT /users/:id` | Email modifications enforce uniqueness checks across all active and inactive records. |
| **Horizontal Privilege Escalation** | `GET /users/:id` | Regular users (`STUDENT`, `TEACHER`, `PARENT`) can only query their own user ID. Accessing other IDs returns 403 Forbidden. |

## 2. Security Controls
- Deny-by-default policy across all management endpoints.
- Role-by-endpoint matrix testing ensures 100% of routes enforce correct role barriers.
