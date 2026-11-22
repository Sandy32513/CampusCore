# V10 Academic Year & Semester: Architecture Document

## 1. Relational Mapping
```text
┌────────────────────────┐
│     academic_years     │
├────────────────────────┤
│ id (PK)                │
│ name (UQ)              │
│ start_date / end_date  │
│ is_current             │
└───────────┬────────────┘
            │ 1:N
            ▼
┌────────────────────────┐       ┌────────────────────────┐
│       semesters        │◄──────┤      enrollments       │
├────────────────────────┤ (1:N) ├────────────────────────┤
│ id (PK)                │       │ id (PK)                │
│ academic_year_id (FK)  │       │ semester_id (FK)       │
│ name                   │       │ student_id (FK)        │
│ term_number            │       └────────────────────────┘
│ is_active / is_closed  │
└────────────────────────┘
```

## 2. Invariant Enforcement
- Date range validation:
  `academic_years.start_date < academic_years.end_date`
  `semesters.start_date >= academic_years.start_date`
  `semesters.end_date <= academic_years.end_date`
- Concurrency control:
  Setting `is_current = true` or `is_active = true` runs inside an atomic transaction resetting any active peer flags before activating the requested record.
