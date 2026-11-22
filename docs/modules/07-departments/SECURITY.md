# V7 Department Management: Security & Threat Model

## 1. Threat Modeling (STRIDE)
- **Unauthorized Department Modification:** Guarded by `requireRole(["SUPER_ADMIN", "ADMIN"])`.
- **SQL Injection:** Parameterized queries via Knex query builder.
- **Code Injection / XSS:** Code and Name inputs sanitized and validated with Zod.
- **Data Orphanage:** Restrict hard deletes; soft deletion via `is_active`.
