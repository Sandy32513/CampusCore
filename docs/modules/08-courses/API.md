# V8 Course Management: API Reference

## Base Path: `/api/v1/courses`

### Endpoints

#### 1. List Courses
- **Method:** `GET`
- **Path:** `/api/v1/courses`
- **Auth:** Required (`requireAuth`)
- **Query Parameters:**
  - `page` (number, default: 1)
  - `pageSize` (number, default: 20)
  - `departmentId` (string, filter by department)
  - `degreeLevel` (`UNDERGRADUATE` | `POSTGRADUATE` | `DIPLOMA` | `CERTIFICATE`)
  - `status` (`active` | `inactive` | `all`, default: `all`)
  - `q` (string, search across code, name, department)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "1",
        "departmentId": "1",
        "departmentCode": "CSE",
        "departmentName": "Computer Science & Engineering",
        "code": "BTECH-CSE",
        "name": "Bachelor of Technology in Computer Science & Engineering",
        "degreeLevel": "UNDERGRADUATE",
        "durationYears": 4.0,
        "totalCredits": 160,
        "isActive": true,
        "createdAt": "2026-11-22T08:00:00.000Z",
        "updatedAt": "2026-11-22T08:00:00.000Z",
        "stats": { "studentCount": 0, "teacherCount": 0, "subjectCount": 0 }
      }
    ]
  },
  "meta": { "page": 1, "pageSize": 20, "total": 1, "totalPages": 1 },
  "message": "Courses retrieved successfully"
}
```

#### 2. Create Course
- **Method:** `POST`
- **Path:** `/api/v1/courses`
- **Auth:** Required (`SUPER_ADMIN`, `ADMIN`)
- **Body:**
```json
{
  "departmentId": "1",
  "code": "BTECH-AI",
  "name": "Bachelor of Technology in Artificial Intelligence",
  "degreeLevel": "UNDERGRADUATE",
  "durationYears": 4.0,
  "totalCredits": 160,
  "description": "Specialized curriculum in AI and ML"
}
```
- **Response (201 Created):** Created course object.
- **Errors:** `400 Bad Request` (validation failed), `404 Not Found` (`DEPARTMENT_NOT_FOUND`), `409 Conflict` (`DUPLICATE_CODE`).

#### 3. Get Course Details
- **Method:** `GET`
- **Path:** `/api/v1/courses/:id`
- **Auth:** Required (`requireAuth`)
- **Response (200 OK):** Course details with department and statistics.

#### 4. Update Course
- **Method:** `PUT`
- **Path:** `/api/v1/courses/:id`
- **Auth:** Required (`SUPER_ADMIN`, `ADMIN`)
- **Body:** `{ name?, departmentId?, degreeLevel?, durationYears?, totalCredits?, isActive? }`
- **Response (200 OK):** Updated course object.

#### 5. Toggle Course Status
- **Method:** `PATCH`
- **Path:** `/api/v1/courses/:id/status`
- **Auth:** Required (`SUPER_ADMIN`, `ADMIN`)
- **Body:** `{ "isActive": false }`
- **Response (200 OK):** Updated course object.
