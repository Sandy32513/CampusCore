# V2 Authentication: Architecture Document

## 1. Request Authentication Lifecycle
```text
Client Request (Cookie: campuscore_session=raw_token)
    │
    ▼
[ Cookie Parser Middleware ]
    │
    ▼
[ requireAuth Middleware ]
    │
    ├─► Computes SHA-256(raw_token)
    ├─► Queries MySQL: SELECT * FROM sessions WHERE token_hash = ? AND expires_at > NOW()
    │      │
    │      ├─► Not Found / Expired ──► Returns 401 Unauthorized
    │      │
    │      └─► Found ──► Queries user record: SELECT * FROM users WHERE id = session.user_id
    │             │
    │             ├─► User inactive ──► Returns 403 Forbidden
    │             └─► Active ──► Attaches `req.user` & `req.session` ──► Calls next()
    ▼
[ Controller / Protected Route ]
```

## 2. Cryptographic Standards
- **Password Hashing:** Argon2id with memory cost 65536 KB, time cost 3, parallelism 1 (or native crypto scrypt fallback when native bindings are unavailable).
- **Session Tokens:** `crypto.randomBytes(32).toString('hex')` (256 bits of entropy).
- **Storage Hash:** `crypto.createHash('sha256').update(rawToken).digest('hex')`.
