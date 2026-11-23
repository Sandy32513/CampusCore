# V4 — Student Management: Security & Access Control

## Access Matrix

| Action | SUPER_ADMIN | ADMIN | TEACHER | STAFF | STUDENT | PARENT |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `GET /students` | ✅ | ✅ | ✅ | ✅ | ✅ (Own) | ❌ (deferred until consent link exists) |
| `GET /students/:id` | ✅ | ✅ | ✅ | ✅ | ✅ (Own) | ❌ (deferred until consent link exists) |
| `POST /students` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `PUT /students/:id` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `PATCH /students/:id/status` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `DELETE /students/:id` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Security Controls
- **Data Protection:** Personal Identifiable Information (PII) including Date of Birth, contact phone, and residential address are protected.
- **Object-level access:** Student sessions are scoped to rows linked by `students.user_id`. Parent reads are denied until V6 supplies a verified, consent-backed guardian/student relationship.
- **SQL Injection Prevention:** Parameterized SQL queries via Knex query builder.
- **Auditing:** Every modification is logged to V38 `audit_logs` with actor ID, IP address, and changed fields.
