# V4 — Student Management: API Specification

## Endpoints

### 1. List Students
`GET /api/v1/students`
- **Query Parameters:** `page`, `pageSize`, `departmentId`, `courseId`, `semesterId`, `status`, `q`
- **Access:** Authenticated users (`SUPER_ADMIN`, `ADMIN`, `TEACHER`, `STAFF`, `STUDENT`)
- **Response:**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "1",
        "admissionNumber": "ADM2026001",
        "fullName": "Demo Student",
        "email": "demo.student@campuscore.edu",
        "departmentName": "Computer Science & Engineering",
        "courseName": "B.Tech in Computer Science & Engineering",
        "currentSemesterName": "Fall 2026",
        "status": "ACTIVE"
      }
    ]
  },
  "meta": { "page": 1, "pageSize": 20, "total": 1, "totalPages": 1 }
}
```

### 2. Admit Student
`POST /api/v1/students`
- **Access:** `SUPER_ADMIN`, `ADMIN`
- **Body:** `CreateStudentInput`
- **Status:** 201 Created

### 3. Get Student Details
`GET /api/v1/students/:id`
- **Status:** 200 OK / 404 Not Found

### 4. Update Student
`PUT /api/v1/students/:id`
- **Access:** `SUPER_ADMIN`, `ADMIN`
- **Body:** `UpdateStudentInput`
- **Status:** 200 OK

### 5. Update Status
`PATCH /api/v1/students/:id/status`
- **Access:** `SUPER_ADMIN`, `ADMIN`
- **Body:** `{ "status": "SUSPENDED" }`
- **Status:** 200 OK

### 6. Delete Student
`DELETE /api/v1/students/:id`
- **Access:** `SUPER_ADMIN`
- **Status:** 200 OK
