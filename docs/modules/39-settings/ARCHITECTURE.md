# V39 System Settings: Architecture Document

## 1. Relational Mapping
```text
┌────────────────────────┐
│    system_settings     │
├────────────────────────┤
│ id (PK)                │
│ category               │
│ setting_key (UQ)       │
│ setting_value (TEXT)   │
│ is_public (BOOLEAN)    │
│ description            │
│ created_at / updated_at│
└────────────────────────┘
```

## 2. Invariant Enforcement
- `setting_key` must be unique across all categories.
- Type casting and Zod parsing guarantees settings values conform to expected formats (e.g. numeric thresholds, valid ISO currency codes, recognized timezones).
