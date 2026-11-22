# V9 — Subject Management: Architecture

## Architectural Flow
```
Client Request (Browser / API)
   ↓
Authentication Middleware (requireAuth)
   ↓
RBAC Authorization (requireRole)
   ↓
Zod Validation (CreateSubjectSchema / MapSubjectToCourseSchema)
   ↓
SubjectService (Business rules, credit verification, uniqueness)
   ↓
MySQL 8.4 LTS (`subjects`, `course_subjects` junction)
   ↓
AuditService (V38 transactional audit record emitted)
   ↓
Structured ApiResponse<SubjectDto>
```

## Relational Design
- `subjects` stores canonical catalog entries owned by departments.
- `course_subjects` resolves the many-to-many relationship between courses and subjects across academic terms.
