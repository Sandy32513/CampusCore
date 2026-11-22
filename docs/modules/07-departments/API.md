# V7 Department Management: API Reference

## Base Path: `/api/v1/departments`

### Endpoints

#### 1. List Departments
- **Method:** `GET`
- **Path:** `/api/v1/departments`
- **Auth:** Required (`requireAuth`)
- **Query Parameters:**
  - `page` (number, default: 1)
  - `pageSize` (number, default: 20)
  - `q` (string, search across code, name, HOD)
  - `status` (`active` | `inactive` | `all`, default: `all`)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "departments": [
      {
        "id": "1",
        "code": "CSE",
        "name": "Computer Science & Engineering",
        "description": "Department of Computer Science and Engineering",
        "headOfDepartment": "Dr. Alan Turing",
        "isActive": true,
        "createdAt": "2026-11-22T08:00:00.000Z",
        "updatedAt": "2026-11-22T08:00:00.000Z",
        "stats": {
          "courseCount": 0,
          "facultyCount": 0,
          "studentCount": 0
        }
      }
    ]
  },
  "meta": { "page": 1, "pageSize": 20, "total": 1, "totalPages": 1 },
  "message": "Departments retrieved successfully"
}
```

#### 2. Create Department
- **Method:** `POST`
- **Path:** `/api/v1/departments`
- **Auth:** Required (`SUPER_ADMIN`, `ADMIN`)
- **Body:**
```json
{
  "code": "MECH",
  "name": "Mechanical Engineering",
  "description": "Department of Mechanical Engineering",
  "headOfDepartment": "Dr. Rudolf Diesel"
}
```
- **Response (201 Created):** Returns created department object.
- **Errors:** `400 Bad Request` (validation failed), `409 Conflict` (`DUPLICATE_CODE`).

#### 3. Get Department Details
- **Method:** `GET`
- **Path:** `/api/v1/departments/:id`
- **Auth:** Required (`requireAuth`)
- **Response (200 OK):** Department object with relational statistics.

#### 4. Update Department
- **Method:** `PUT`
- **Path:** `/api/v1/departments/:id`
- **Auth:** Required (`SUPER_ADMIN`, `ADMIN`)
- **Body:** `{ name?, description?, headOfDepartment?, isActive? }`
- **Response (200 OK):** Updated department object.

#### 5. Toggle Department Status
- **Method:** `PATCH`
- **Path:** `/api/v1/departments/:id/status`
- **Auth:** Required (`SUPER_ADMIN`, `ADMIN`)
- **Body:** `{ "isActive": false }`
- **Response (200 OK):** Updated department status.
