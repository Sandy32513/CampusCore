# V9 — Subject Management: Security & Access Control

## Access Matrix

| Action | SUPER_ADMIN | ADMIN | TEACHER | STAFF | STUDENT | PARENT |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `GET /subjects` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /subjects/:id` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /subjects` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `PUT /subjects/:id` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `PATCH /subjects/:id/status` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `POST /subjects/:id/courses` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `DELETE /subjects/:id/courses/:id` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

## Security Controls
- **Authorization:** Only Admin roles may mutate academic subjects or course curriculum bindings.
- **Auditing:** All operations emit audit events (`SUBJECT_CREATE`, `SUBJECT_UPDATE`, `COURSE_SUBJECT_MAP`, `COURSE_SUBJECT_UNMAP`).
