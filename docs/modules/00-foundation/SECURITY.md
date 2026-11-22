# V0 Foundation: Security & Threat Model

## 1. Threat Modeling (STRIDE)

| Threat | Target | Mitigation |
|---|---|---|
| **Information Disclosure** | `/health` API | The health endpoint deliberately suppresses database versions, server IPs, database usernames, and stack traces. It only reports boolean status (`connected` / `disconnected`). |
| **Tampering** | Configuration / Environment | Environment variables are validated on startup using Zod. Process halts immediately if invalid or missing variables are detected. |
| **Denial of Service** | Health probe flooding | Foundation implements basic rate limiting middleware to prevent probe spamming. |
| **Elevation of Privilege** | Database Access | Application connects using dedicated `sms_app` account, not `root`. Migration scripts use `sms_migrator`. |
| **Credential Exposure** | Source control | `.gitignore` explicitly blocks `.env`, `.env.local`, and database dumps. `.env.example` contains only placeholder tokens. |

## 2. Security Controls in V0
- HTTP Security Headers enabled via `helmet` (Disabling X-Powered-By, Content-Security-Policy baseline, X-Content-Type-Options: nosniff).
- CORS policy restricted by `APP_BASE_URL` in production; configured for local loopback in development.
