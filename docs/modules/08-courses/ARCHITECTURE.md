# V8 Course Management: Architecture Document

## 1. Relational Mapping
```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   departments   │◄──────┤     courses     │◄──────┤    students     │
├─────────────────┤ (1:N) ├─────────────────┤ (1:N) ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ code            │       │ department_id FK│       │ course_id (FK)  │
│ name            │       │ code (UQ)       │       └─────────────────┘
└─────────────────┘       │ name            │       ┌─────────────────┐
                          │ degree_level    │◄──────┤    subjects     │
                          │ duration_years  │ (1:N) ├─────────────────┤
                          │ total_credits   │       │ id (PK)         │
                          │ is_active       │       │ course_id (FK)  │
                          └─────────────────┘       └─────────────────┘
```

## 2. Invariant Enforcement
- `department_id` must resolve to an existing department record.
- Deleting a department with linked courses returns HTTP 409 Conflict.
- `duration_years` must be positive (> 0) and <= 10.
- `total_credits` must be >= 1.
