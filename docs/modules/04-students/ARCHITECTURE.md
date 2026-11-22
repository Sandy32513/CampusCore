# V4 — Student Management: Architecture

## Architectural Flow
```
Client Request (Browser / API)
   ↓
Authentication Middleware (requireAuth)
   ↓
RBAC Authorization (requireRole)
   ↓
Zod Schema Validation (CreateStudentSchema / UpdateStudentSchema)
   ↓
StudentService (Business Logic & Foreign Key Verification)
   ↓
MySQL 8.4 LTS (`students` table joined to departments, courses, semesters)
   ↓
AuditService (V38 transactional audit record emitted)
   ↓
Structured ApiResponse<StudentDto>
```

## Resilience & Isolation
- Decoupled from direct UI components through `@campuscore/shared` types and schemas.
- In-memory repository fallback preserves development testability during off-line workflows.
