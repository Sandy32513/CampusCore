# V4 — Student Management: Security & Access Control

## Access Matrix

| Action | SUPER_ADMIN | ADMIN | TEACHER | STAFF | STUDENT | PARENT |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `GET /students` | ✅ | ✅ | ✅ | ✅ | ✅ (Own) | ✅ (Child) |
| `GET /students/:id` | ✅ | ✅ | ✅ | ✅ | ✅ (Own) | ✅ (Child) |
| `POST /students` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `PUT /students/:id` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `PATCH /students/:id/status` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `DELETE /students/:id` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Security Controls
- **Data Protection:** Personal Identifiable Information (PII) including Date of Birth, contact phone, and residential address are protected.
- **SQL Injection Prevention:** Parameterized SQL queries via Knex query builder.
- **Auditing:** Every modification is logged to V38 `audit_logs` with actor ID, IP address, and changed fields.
