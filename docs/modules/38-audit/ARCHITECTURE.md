# V38 Audit Logs: Architecture Document

## 1. Relational Mapping
```text
┌─────────────────┐       ┌─────────────────┐
│      users      │◄──────┤   audit_logs    │
├─────────────────┤ (1:N) ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ email           │       │ user_id (FK)    │
│ role            │       │ user_email      │
└─────────────────┘       │ role            │
                          │ action          │
                          │ entity          │
                          │ entity_id       │
                          │ details (JSON)  │
                          │ ip_address      │
                          │ status          │
                          │ created_at (IDX)│
                          └─────────────────┘
```

## 2. Invariant Enforcement
- Immutability: No `UPDATE` or `DELETE` methods exposed in `auditService` or `routes/audit.ts`.
- Referential safety: `user_id` has `ON DELETE SET NULL`, preserving historical audit records even if a user account is purged.
