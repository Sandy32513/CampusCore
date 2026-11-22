# V2 Authentication: Security & Threat Model

## 1. Threat Modeling (STRIDE)

| Threat | Target | Mitigation |
|---|---|---|
| **Credential Stuffing / Brute Force** | `POST /login` | Rate limiting restricts attempts per IP. Account lockout after repeated failures. |
| **Account Enumeration** | `POST /login` | Constant-time response and identical error message (`"Invalid email or password"`) regardless of whether email exists. |
| **Session Hijacking** | Session Token | `httpOnly` prevents JavaScript access; `SameSite=Lax` mitigates CSRF; token stored in DB as SHA-256 hash (database leak does not expose valid session cookies). |
| **Password Database Breach** | `users` table | Argon2id slow-hash makes GPU/ASIC rainbow table attacks computationally infeasible. |
| **Session Fixation** | Login transition | New session record created upon login; existing session destroyed on logout. |

## 2. Security Controls
- No sensitive fields (`password_hash`) are ever serialized in JSON responses or log outputs.
