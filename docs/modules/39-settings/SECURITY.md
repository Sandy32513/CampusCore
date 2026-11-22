# V39 System Settings: Security & Threat Model

## 1. Threat Modeling (STRIDE)
- **Privilege Escalation:** Only `SUPER_ADMIN` can mutate system settings. Ordinary `ADMIN`, `TEACHER`, `STAFF`, `STUDENT`, `PARENT` are rejected with HTTP 403.
- **Information Disclosure:** Security-sensitive parameters (session timeouts, secret keys) are marked `is_public = false` and excluded from `/api/v1/settings/public`.
- **Config Tampering:** All setting changes recorded in V38 Audit Logs with actor identity and payload diffs.
