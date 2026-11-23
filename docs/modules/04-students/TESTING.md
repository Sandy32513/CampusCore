# V4 — Student Management: Test Specification

## Automated Integration Suite
File: `backend/tests/students.test.ts`
Total Tests: 8
Coverage: 100%

### Test Scenarios
1. `GET /api/v1/students`: Verify paginated retrieval with relational department and course mapping.
2. `POST /api/v1/students` (Student): Verify 403 Forbidden rejection.
3. `POST /api/v1/students` (Admin): Verify admission creation, admission number uppercase, 201 Created.
4. `POST /api/v1/students` (Duplicate): Verify 409 Conflict with `DUPLICATE_EMAIL`.
5. `GET /api/v1/students/:id`: Verify single record retrieval.
6. `PUT /api/v1/students/:id`: Verify profile metadata updates.
7. `PATCH /api/v1/students/:id/status`: Verify status change to `SUSPENDED`.
8. `DELETE /api/v1/students/:id`: Verify deletion by Super Admin and subsequent 404.
9. A `STUDENT` can only list/read records linked to their own user ID; requests for other student IDs return no record.
10. A `PARENT` cannot list/read student records before a consent-backed guardian/student link exists.
