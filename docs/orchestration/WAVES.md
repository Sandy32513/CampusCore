# SMS Orchestration Waves (V0 - V49)

## 1. Concurrency Model & Wave Rules
- **Maximum Concurrent Modules:** `MAX_PARALLEL_MODULES = 3`.
- **Wave Transition Rule:** A wave begins **only** when all modules in the preceding wave are completely verified, integrated, and marked **FROZEN** (or `FROZEN-PROVISIONAL` under deferred UAT).
- **Parallel Worktree Isolation:** Each specialist agent operates in its own git worktree: `feature/vNN-<slug>/<agent>`.
- **Integrator Ownership:** Shared files (route registries, navigation, migration indexes, `package.json`, lockfiles) are updated only by the Integrator during wave integration.
- **Defect Bound:** Maximum 3 fix iterations per defect; if unresolved, escalate to human checkpoint with diagnosis.

---

## 2. Wave Execution Plan

| Wave | Modules | Dependencies | Concurrency | Focus / Domain |
|---|---|---|:---:|---|
| **Wave 1** | **V0** Project Foundation | None | 1 | Toolchains, Docker/MySQL baseline, skeleton repos, health check API |
| **Wave 2** | **V1** Application Shell | V0 | 1 | Design system, responsive shell, sidebar, header, module card registry |
| **Wave 3** | **V2** Authentication | V1 | 1 | Argon2id, MySQL session store, cookie auth, login/logout, route guards |
| **Wave 4** | **V3** User & Role Management | V2 | 1 | 6 RBAC roles, permission constants, user management |
| **Wave 5** | **V7** Department Management<br>**V10** Academic Year & Semester<br>**V38** Audit Logs | V3<br>V3<br>V3 | 3 | Core academic structures & foundational audit logging (ADR-001, ADR-002) |
| **Wave 6** | **V8** Course Management<br>**V39** System Settings | V7<br>V3 | 2 | Courses mapped to departments; institutional settings & branding |
| **Wave 7** | **V4** Student Management<br>**V9** Subject Management<br>**V40** Backup & Recovery | V3, V7, V8, V10<br>V8, V10<br>V39 | 3 | Core student lifecycle (FKs resolved); subject catalogue; MySQL automated backup |
| **Wave 8** | **V5** Student Profile<br>**V6** Parent / Guardian Management<br>**V12** Teacher Management | V4<br>V4<br>V3, V7, V9 | 3 | Student profile view with tab extension registry; guardian mapping; faculty profiles |
| **Wave 9** | **V11** Class / Section Management<br>**V23** Student Documents<br>**V24** Fees & Finance | V4, V8, V10, V12<br>V4<br>V4, V8, V10 | 3 | Class/section capacities; document uploads; fee structures & student assignments |
| **Wave 10** | **V13** Teacher Assignment<br>**V14** Student Enrollment<br>**V25** Payment Records | V9, V11, V12<br>V4, V8, V10, V11<br>V24 | 3 | Teacher allocation matrix; section admissions; payment records & receipt sequence |
| **Wave 11** | **V15** Attendance<br>**V17** Timetable<br>**V18** Examination Management | V13, V14<br>V11, V13<br>V9, V10, V14 | 3 | Daily attendance marking; timetable clash detection; exam scheduling |
| **Wave 12** | **V16** Attendance Analytics<br>**V19** Marks Management<br>**V21** Assignment Management | V15<br>V13, V18<br>V13, V14 | 3 | Attendance statistics & alerts; marks entry & locking; student assignments |
| **Wave 13** | **V20** Grade Management<br>**V22** Study Material Management<br>**V26** Library Management | V19<br>V9, V13<br>V4, V12 | 3 | GPA calculation & grade scales; syllabi & lecture notes; books inventory & issues |
| **Wave 14** | **V27** Transport Management<br>**V28** Hostel Management<br>**V29** Communication | V4, V24<br>V4, V24<br>V3, V4, V6, V12 | 3 | Bus routes & transport fees; hostel rooms & bed allocations; broadcast notices |
| **Wave 15** | **V30** Notifications<br>**V31** Reports<br>**V33** Search & Advanced Filters | V29<br>V4, V7, V8, V15, V19, V20, V25<br>V4, V7, V8, V9, V12, V15, V24 | 3 | Multi-channel in-app notification center; comprehensive reports engine; global search |
| **Wave 16** | **V32** Dashboard Analytics<br>**V34** Import / Export<br>**V35** ID Card Management | V16, V20, V25, V30<br>V4, V12, V19, V31<br>V4, V12, V23 | 3 | Role-specific dashboard widgets; bulk CSV/Excel pipelines; printable ID cards with QR |
| **Wave 17** | **V36** Certificate Management<br>**V37** Helpdesk / Support | V4, V8, V20<br>V3, V30 | 2 | Configurable certificate generator; student/parent support tickets |
| **Wave 18** | **V41** Security Hardening<br>**V42** Performance Optimization<br>**V43** Accessibility (a11y) | V1 - V40 (All Frozen)<br>V1 - V40 (All Frozen)<br>V1 - V40 (All Frozen) | 3 | Parallel audits on frozen baseline: threat modeling, EXPLAIN review, axe-core WCAG AA |
| **Wave 19** | **V44** Responsive / Mobile Optimization<br>**V45** API Platform | V1 - V40 (All Frozen)<br>V1 - V40 (All Frozen) | 2 | Viewport responsive audit (375px to 1440px); unified public API & OpenAPI 3.1 |
| **Wave 20** | **V46** Integration Layer<br>**V47** Production Deployment | V30, V45<br>V40, V41, V42, V45 | 2 | Decoupled third-party adapters; production Docker Compose, HTTPS proxy, runbooks |
| **Wave 21** | **V48** Monitoring & Observability | V47 | 1 | Health endpoints, Pino log aggregation, metric counters, backup alarms |
| **Wave 22** | **V49** Final Production Certification | V0 - V48 (All Frozen) | 1 | Full platform regression, automated disaster recovery test, final acceptance |

---

## 3. Concurrency Safety Verification
1. **Database Isolation:** Concurrently executing modules never write to the same table. Shared dependencies (e.g., `departments` read by `courses`) are accessed strictly read-only after the dependency is frozen.
2. **Route Namespacing:** Every backend API route is namespaced under `/api/v1/<slug>/` and every frontend route is under `/<slug>/`.
3. **Migration Independence:** Each migration file is prefixed with `YYYYMMDDHHMMSS_<slug>_<description>.sql`. Knex runs migrations sequentially. Integrator validates that migrate-from-empty and rollback tests pass cleanly after every wave integration.
