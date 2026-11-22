# V38 Audit Logs: API Reference

## Base Path: `/api/v1/audit-logs`

### Security Policy
- Accessible exclusively by `SUPER_ADMIN` and `ADMIN` roles.
- Strictly append-only: external `POST`, `PUT`, `PATCH`, and `DELETE` endpoints do not exist (HTTP 404/405).

### Endpoints

#### 1. List Audit Logs
- **Method:** `GET`
- **Path:** `/api/v1/audit-logs`
- **Auth:** Required (`SUPER_ADMIN`, `ADMIN`)
- **Query Parameters:**
  - `page` (number, default: 1)
  - `pageSize` (number, default: 20)
  - `userId` (string, filter by actor user ID)
  - `action` (string, filter by event verb e.g. `DEPARTMENT_CREATE`)
  - `entity` (string, filter by entity type e.g. `DEPARTMENT`, `USER`, `ACADEMIC_YEAR`)
  - `status` (`SUCCESS` | `FAILURE` | `WARNING`)
  - `startDate` (ISO string / date)
  - `endDate` (ISO string / date)
  - `q` (string, keyword search across action, entity, user_email, and entity_id)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "1",
        "userId": "1",
        "userEmail": "admin@campuscore.edu",
        "role": "SUPER_ADMIN",
        "action": "DEPARTMENT_CREATE",
        "entity": "DEPARTMENT",
        "entityId": "3",
        "details": { "code": "MECH", "name": "Mechanical Engineering" },
        "ipAddress": "127.0.0.1",
        "userAgent": "Mozilla/5.0 ...",
        "status": "SUCCESS",
        "createdAt": "2026-11-22T08:35:00.000Z"
      }
    ]
  },
  "meta": { "page": 1, "pageSize": 20, "total": 1, "totalPages": 1 },
  "message": "Audit logs retrieved successfully"
}
```

#### 2. Get Audit Log by ID
- **Method:** `GET`
- **Path:** `/api/v1/audit-logs/:id`
- **Auth:** Required (`SUPER_ADMIN`, `ADMIN`)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "log": {
      "id": "1",
      "userId": "1",
      "userEmail": "admin@campuscore.edu",
      "role": "SUPER_ADMIN",
      "action": "DEPARTMENT_CREATE",
      "entity": "DEPARTMENT",
      "entityId": "3",
      "details": { "code": "MECH", "name": "Mechanical Engineering" },
      "ipAddress": "127.0.0.1",
      "userAgent": "Mozilla/5.0 ...",
      "status": "SUCCESS",
      "createdAt": "2026-11-22T08:35:00.000Z"
    }
  },
  "message": "Audit log retrieved successfully"
}
```
