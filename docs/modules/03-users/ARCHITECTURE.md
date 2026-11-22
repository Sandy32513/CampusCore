# V3 User & Role Management: Architecture Document

## 1. RBAC Policy Architecture
```text
Request ──► [ requireAuth ] ──► [ requireRole(allowedRoles) ]
                                      │
                                      ├─► req.user.role in allowedRoles?
                                      │      │
                                      │      ├─► Yes ──► next()
                                      │      │
                                      │      └─► No  ──► 403 Forbidden
```

## 2. Relational Schema
```text
┌─────────────────┐       ┌──────────────────────┐       ┌─────────────────┐
│      users      │       │   role_permissions   │       │   permissions   │
├─────────────────┤       ├──────────────────────┤       ├─────────────────┤
│ id (PK)         │       │ role_id (FK) (PK)    │       │ id (PK)         │
│ email (UQ)      │       │ permission_id (FK)(PK)◄──────┤ resource        │
│ password_hash   │       └──────────▲───────────┘       │ action          │
│ first_name      │                  │                   │ description     │
│ last_name       │       ┌──────────┴───────────┐       └─────────────────┘
│ role ───────────┼──────►│        roles         │
│ is_active       │       ├──────────────────────┤
│ created_at      │       │ id (PK)              │
│ updated_at      │       │ name (UQ)            │
└─────────────────┘       │ description          │
                          │ is_system            │
                          └──────────────────────┘
```
