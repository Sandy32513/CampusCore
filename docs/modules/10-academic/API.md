# V10 Academic Year & Semester: API Reference

## Base Path: `/api/v1/academic-years` & `/api/v1/semesters`

### Endpoints

#### 1. List Academic Years
- **Method:** `GET`
- **Path:** `/api/v1/academic-years`
- **Auth:** Required (`requireAuth`)
- **Query Parameters:** `page`, `pageSize`, `isCurrent`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "academicYears": [
      {
        "id": "1",
        "name": "2026-2027",
        "startDate": "2026-08-01",
        "endDate": "2027-06-30",
        "isCurrent": true,
        "isActive": true,
        "createdAt": "2026-11-22T08:00:00.000Z",
        "updatedAt": "2026-11-22T08:00:00.000Z",
        "semesters": [ ... ]
      }
    ]
  },
  "meta": { "page": 1, "pageSize": 20, "total": 1, "totalPages": 1 },
  "message": "Academic years retrieved successfully"
}
```

#### 2. Get Current Academic Year
- **Method:** `GET`
- **Path:** `/api/v1/academic-years/current`
- **Auth:** Required (`requireAuth`)
- **Response (200 OK):** Returns the current active academic year and its semesters.

#### 3. Create Academic Year
- **Method:** `POST`
- **Path:** `/api/v1/academic-years`
- **Auth:** Required (`SUPER_ADMIN`, `ADMIN`)
- **Body:** `{ "name": "2027-2028", "startDate": "2027-08-01", "endDate": "2028-06-30", "isCurrent": false }`
- **Response (201 Created):** Created academic year.

#### 4. Update Academic Year
- **Method:** `PUT`
- **Path:** `/api/v1/academic-years/:id`
- **Auth:** Required (`SUPER_ADMIN`, `ADMIN`)
- **Body:** `{ name?, startDate?, endDate?, isCurrent?, isActive? }`
- **Response (200 OK):** Updated academic year.

#### 5. Set Academic Year as Current
- **Method:** `PATCH`
- **Path:** `/api/v1/academic-years/:id/set-current`
- **Auth:** Required (`SUPER_ADMIN`, `ADMIN`)
- **Response (200 OK):** Updated academic year with `isCurrent: true`.

#### 6. List Semesters for Academic Year
- **Method:** `GET`
- **Path:** `/api/v1/academic-years/:yearId/semesters`
- **Auth:** Required (`requireAuth`)
- **Response (200 OK):** Semesters ordered by `termNumber`.

#### 7. Create Semester
- **Method:** `POST`
- **Path:** `/api/v1/academic-years/:yearId/semesters`
- **Auth:** Required (`SUPER_ADMIN`, `ADMIN`)
- **Body:** `{ "name": "Fall 2027", "termNumber": 1, "startDate": "2027-08-15", "endDate": "2027-12-15", "isActive": false }`
- **Response (201 Created):** Created semester.

#### 8. Activate Semester
- **Method:** `PATCH`
- **Path:** `/api/v1/semesters/:id/activate`
- **Auth:** Required (`SUPER_ADMIN`, `ADMIN`)
- **Response (200 OK):** Activated semester.
