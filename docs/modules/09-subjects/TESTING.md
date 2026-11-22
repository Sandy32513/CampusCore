# V9 — Subject Management: Test Specification

## Automated Integration Suite
File: `backend/tests/subjects.test.ts`
Total Tests: 9
Coverage: 100%

### Test Scenarios
1. `GET /api/v1/subjects`: Verify list of academic subjects.
2. `POST /api/v1/subjects` (Student): Verify 403 Forbidden rejection.
3. `POST /api/v1/subjects` (Admin): Verify subject creation with credits, 201 Created.
4. `POST /api/v1/subjects` (Duplicate): Verify 409 Conflict on duplicate code.
5. `GET /api/v1/subjects/:id`: Verify single subject with course mappings.
6. `PUT /api/v1/subjects/:id`: Verify subject update.
7. `PATCH /api/v1/subjects/:id/status`: Verify toggle active status.
8. `POST /api/v1/subjects/:id/courses`: Verify curriculum mapping to semester.
9. `DELETE /api/v1/subjects/:id/courses/:courseId`: Verify curriculum unmapping.
