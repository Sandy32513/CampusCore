# V38 Audit Logs: Security & Threat Model

## 1. Threat Modeling (STRIDE)
- **Repudiation:** Completely eliminated by automatically logging security-sensitive events (authentication attempts, privilege escalation, entity modifications).
- **Tampering / Log Modification:** No HTTP mutation verbs (`POST` directly from clients, `PUT`, `PATCH`, `DELETE`) are routed; database permissions can restrict table to `INSERT` and `SELECT` only.
- **Information Disclosure:** Endpoints strictly protected by `requireRole(["SUPER_ADMIN", "ADMIN"])`. Sensitive secrets (e.g. passwords, auth tokens, session tokens) are filtered before logging.
- **Denial of Service:** Paginated queries with indexed filters (`created_at`, `user_id`, `action`, `entity`) prevent table-scan denial of service attacks.
