# V10 Academic Year & Semester: Testing Specification

## 1. Test Strategy
- Integration testing using Vitest and Supertest against REST API endpoints.
- Date validation: start date must strictly precede end date.
- Temporal containment: semester dates must fall within academic year boundary.
- Uniqueness invariants: unique year names and unique term numbers within an academic year.
- Single current year invariant: activating a new year resets peer current flags.
- Single active semester invariant: activating a semester resets peer active flags.
- Role-based authorization: Admin privileges required for all calendar mutations.

## 2. Test Cases Covered in `backend/tests/academic.test.ts`
- `GET /api/v1/academic-years`: Returns list with semester counts.
- `GET /api/v1/academic-years/current`: Fetches operational academic cycle.
- `POST /api/v1/academic-years as Student`: 403 Forbidden.
- `POST /api/v1/academic-years with inverted dates`: Fails with 400 Validation Error.
- `POST /api/v1/academic-years as Admin`: Successfully creates year.
- `PATCH /api/v1/academic-years/:id/set-current`: Atomically sets current year.
- `POST /api/v1/academic-years/:yearId/semesters out of bounds`: 400 Date Out of Bounds error.
- `POST /api/v1/academic-years/:yearId/semesters`: Successfully creates semester.
- `PATCH /api/v1/semesters/:id/activate`: Atomically activates operational semester.
