# V8 Course Management: Security & Threat Model

## 1. Threat Modeling (STRIDE)
- **Unauthorized Course Modification:** Guarded by `requireRole(["SUPER_ADMIN", "ADMIN"])`.
- **Referential Orphanage Attack:** Foreign key `department_id` has `ON DELETE RESTRICT` in MySQL schema.
- **Invalid Payload Injection:** Zod schemas enforce code format, duration limits, and valid degree levels.
- **Audit Tampering:** All course creation, update, and status change events automatically dispatched to immutable V38 Audit Logs.
