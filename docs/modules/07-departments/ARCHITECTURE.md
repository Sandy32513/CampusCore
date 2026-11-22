# V7 Department Management: Architecture Document

## 1. Relational Mapping
```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   departments   │◄──────┤     courses     │◄──────┤    students     │
├─────────────────┤ (1:N) ├─────────────────┤ (1:N) ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ code (UQ)       │       │ department_id FK│       │ department_id FK│
│ name            │       └─────────────────┘       │ course_id FK    │
│ is_active       │                                 └─────────────────┘
└─────────────────┘
```
Exposes clean primary key relations consumed by downstream modules V8 and V4.
