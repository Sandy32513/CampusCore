# V9 — Subject Management: API Specification

## Endpoints

### 1. List Subjects
`GET /api/v1/subjects`
- **Query Parameters:** `page`, `pageSize`, `departmentId`, `courseId`, `type`, `isElective`, `status`, `q`
- **Access:** Authenticated users
- **Status:** 200 OK

### 2. Create Subject
`POST /api/v1/subjects`
- **Access:** `SUPER_ADMIN`, `ADMIN`
- **Body:** `CreateSubjectInput`
- **Status:** 201 Created

### 3. Get Subject Details
`GET /api/v1/subjects/:id`
- **Status:** 200 OK / 404 Not Found

### 4. Update Subject Metadata
`PUT /api/v1/subjects/:id`
- **Access:** `SUPER_ADMIN`, `ADMIN`
- **Body:** `UpdateSubjectInput`
- **Status:** 200 OK

### 5. Toggle Status
`PATCH /api/v1/subjects/:id/status`
- **Access:** `SUPER_ADMIN`, `ADMIN`
- **Body:** `{ "isActive": false }`
- **Status:** 200 OK

### 6. Map Subject to Course
`POST /api/v1/subjects/:id/courses`
- **Access:** `SUPER_ADMIN`, `ADMIN`
- **Body:** `MapSubjectToCourseInput`
- **Status:** 201 Created / 409 Conflict

### 7. Unmap Subject from Course
`DELETE /api/v1/subjects/:id/courses/:courseId`
- **Access:** `SUPER_ADMIN`, `ADMIN`
- **Status:** 200 OK
