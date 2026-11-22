# Dependency Graph (DAG) for SMS (V0 - V49)

## 1. Overview
This document defines the directed acyclic graph (DAG) governing the build order and prerequisite dependencies for all 50 modules (V0 through V49) of the Student Management System (SMS).

Per **Hard Rule §62 & §76** of the Master Plan:
- A module can only begin when **all** of its upstream dependencies are **FROZEN**.
- Cyclic dependencies are prohibited.
- Concurrency between modules is strictly constrained by this DAG and the maximum concurrency limit (`MAX_PARALLEL_MODULES = 3`).

---

## 2. Dependency Table (V0 - V49)

| Module ID | Module Name | Depends On | Rationale / Key Coupling |
|---|---|---|---|
| **V0** | Project Foundation | None | Initial project structure, toolchains, base configurations, health check |
| **V1** | Application Shell | V0 | Shell layout, responsive nav, theme, design system components, module registry |
| **V2** | Authentication | V1 | Login/logout UI & API, session management in MySQL, Argon2, secure cookie |
| **V3** | User & Role Management | V2 | 6 RBAC roles, user CRUD, permission assignment & registry |
| **V7** | Department Management | V3 | Academic department entity, department heads (per ADR-001) |
| **V10** | Academic Year & Semester | V3 | Academic years, terms, semesters, active semester tracking (per ADR-001) |
| **V38** | Audit Logs | V3 | Central transactional audit event sink (placed early per ADR-002) |
| **V8** | Course Management | V7 | Academic courses mapped to departments (`department_id` FK) |
| **V39** | System Settings | V3 | Institution profile, branding, locale, currency, global configs |
| **V4** | Student Management | V3, V7, V8, V10 | Student core entity with enforced FKs to department, course, semester (ADR-001) |
| **V9** | Subject Management | V8, V10 | Academic subjects linked to courses and semesters |
| **V40** | Backup & Recovery | V39 | MySQL automated backup, restore validation, binlog point-in-time recovery |
| **V5** | Student Profile | V4 | Aggregated profile view for students with tab registry (ADR-002) |
| **V6** | Parent / Guardian Management | V4 | Guardian records and student-parent relationships |
| **V12** | Teacher Management | V3, V7, V9 | Faculty profiles, department assignment, subject specializations |
| **V11** | Class / Section Management | V4, V8, V10, V12 | Classes, sections, capacity limits, class teachers |
| **V23** | Student Documents | V4 | Document uploads, verification, categorization, attachment to student |
| **V24** | Fees & Finance | V4, V8, V10 | Fee structures, student fee assignments, scholarships, discounts |
| **V13** | Teacher Assignment | V9, V11, V12 | Mapping teachers to course, subject, class, and semester |
| **V14** | Student Enrollment | V4, V8, V10, V11 | Section allocations, enrollment history, course admissions |
| **V25** | Payment Records | V24 | Immutable payment entries, receipt sequences, balance reconciliation |
| **V15** | Attendance | V13, V14 | Subject/class session attendance marking by assigned teachers |
| **V17** | Timetable | V11, V13 | Class & teacher timetables, room allocation, clash detection |
| **V18** | Examination Management | V9, V10, V14 | Exam scheduling, rooms, max marks, student eligibility |
| **V16** | Attendance Analytics | V15 | Daily, monthly, semester aggregations, trends, shortage alerts |
| **V19** | Marks Management | V13, V18 | Marks entry, verification, locking, bulk import |
| **V21** | Assignment Management | V13, V14 | Homework/assignment creation, deadline tracking, student submissions |
| **V20** | Grade Management | V19 | Grade scales, GPA calculation, pass/fail rules, versioned scales |
| **V22** | Study Material Management | V9, V13 | Course/subject syllabus, notes, lecture resources |
| **V26** | Library Management | V4, V12 | Books catalog, inventory, issues, returns, fines |
| **V27** | Transport Management | V4, V24 | Routes, vehicles, drivers, stops, student fee integration |
| **V28** | Hostel Management | V4, V24 | Buildings, rooms, beds allocation, vacancy tracking, hostel fees |
| **V29** | Communication | V3, V4, V6, V12 | Announcements, audience targeting, internal messages |
| **V30** | Notifications | V29 | Central notification engine for attendance, exams, fees, alerts |
| **V31** | Reports | V4, V7, V8, V15, V19, V20, V25 | Multi-domain report generator (PDF, CSV, Excel) |
| **V33** | Search & Advanced Filters | V4, V7, V8, V9, V12, V15, V24 | Unified global search across all core entities |
| **V32** | Dashboard Analytics | V16, V20, V25, V30 | Executive & role-based dashboard metric widgets |
| **V34** | Import / Export | V4, V12, V19, V31 | Bulk data pipeline: validation, preview, confirmation |
| **V35** | ID Card Management | V4, V12, V23 | Print-ready student & teacher ID cards with QR codes |
| **V36** | Certificate Management | V4, V8, V20 | Bonafide, transfer, course completion certificates |
| **V37** | Helpdesk / Support | V3, V30 | Issue ticketing, assignment, resolution tracking |
| **V41** | Security Hardening | V1 - V40 | Parallel security audit & penetration testing across all modules |
| **V42** | Performance Optimization | V1 - V40 | Query tuning, EXPLAIN reviews, indexing, bundle & caching pass |
| **V43** | Accessibility (a11y) | V1 - V40 | WCAG 2.2 AA audit, screen-reader semantics, keyboard navigation |
| **V44** | Responsive / Mobile Optimization | V1 - V40 | Viewport audits (375px, 768px, 1024px, 1440px), touch targets |
| **V45** | API Platform | V1 - V40 | Clean `/api/v1` external surface, rate-limiting, OpenAPI 3.1 docs |
| **V46** | Integration Layer | V30, V45 | Decoupled integration adapters (Email, SMS, Storage, Webhooks) |
| **V47** | Production Deployment | V40, V41, V42, V45 | Production containerization, reverse proxy, secrets, migration scripts |
| **V48** | Monitoring & Observability | V47 | Structured logging, Prometheus/Grafana, health checks, uptime |
| **V49** | Final Production Certification | V0 - V48 | End-to-end regression, disaster recovery restore, final sign-off |

---

## 3. Cycle Detection and Mathematical Verification
A depth-first search (DFS) topological validation was executed against this graph:
- **Total nodes:** 50 (V0 - V49)
- **Cycles detected:** 0
- **Longest dependency path (critical path length):** 18 levels
- **Graph status:** STRICTLY ACYCLIC (Valid DAG)

---

## 4. Special Graph Constraints

1. **Academic Foundations Preceding Student Management (ADR-001):**
   `V7` (Department), `V10` (Academic Year/Semester), and `V8` (Course) must be frozen before `V4` (Student) can be designed. This ensures foreign key constraints (`department_id`, `course_id`, `semester_id`) are immutable and non-nullable from day one.

2. **Early Audit Logging (ADR-002):**
   `V38` (Audit Logs) depends only on `V3` (User Management). Placing it in Wave 5 provides the shared audit infrastructure and schema early so all subsequent business modules can record audit entries in their database transactions.

3. **Hardening Modules (V41 - V44):**
   V41, V42, V43, and V44 run as **parallel audits** that inspect the frozen V1-V40 codebase and generate findings. Fixes are applied as serialized change requests (`CR-xxx`) to individual modules to prevent concurrent edits.
