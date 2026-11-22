# Student Management System (SMS): Technical Requirements Document

*Version 1.0 draft · 22 November 2026 · Status: for technical approval · Companion to the SMS Product Requirements Document (PRD) · Source: SMS Master Plan (V0 to V49)*

## 1. Purpose and scope

This document defines how SMS is built: architecture, database, API, security, quality, deployment and delivery rules. The PRD says what the product does. This document says how it must be engineered so that 50 modules, built partly in parallel, stay compatible.

Two hard constraints come from the master plan: **MySQL is the only database in every environment**, and the product is a **web application with no PWA features**. Items marked **proposed** are my recommendations where the plan is silent; they are collected as decisions in section 15.

## 2. Environment baseline

The development machine, as reported:

| Item | Value |
| --- | --- |
| MySQL Server | 8.4.13, Windows service MySQL84, running, automatic startup |
| Listeners | 127.0.0.1:3306 (classic protocol), 33060 (X Protocol) |
| Server directory | C:\\Program Files\\MySQL\\MySQL Server 8.4 |
| Data directory | C:\\ProgramData\\MySQL\\MySQL Server 8.4\\Data |
| Client tools | MySQL Command Line Client, MySQL Shell 26.10.0 (C:\\Program Files\\MySQL\\MySQL Shell 26.10), MySQL Workbench 26.10.0 |

What this means for the project:

1. **Version parity.** CI uses the `mysql:8.4` service container and staging and production run MySQL 8.4. The same release series everywhere avoids “works on my machine” database differences. Record the exact patch version in each release note.
2. **Connect to 127.0.0.1, not localhost.** On Windows, Node.js may resolve `localhost` to the IPv6 address first, which fails or stalls against an IPv4 listener.
3. **Port 33060 is not used by the application.** The app uses the classic protocol on 3306 through the mysql2 driver. 33060 serves MySQL Shell only. Keep it on loopback, and disable it (`mysqlx=OFF`) or firewall it on any server unless needed.
4. **Never touch the data directory.** No copying, editing or file-level backups of `Data`. All backups go through dump tools (section 11).
5. **Table-name case rule.** On Windows MySQL treats table names case-insensitively (`lower_case_table_names=1`). On Linux the default is case-sensitive, and the setting cannot be changed after initialization. Therefore all identifiers are lowercase snake\_case, always, and CI runs on Linux so a mismatch fails early.
6. **MySQL 8.4 defaults to design for:** `caching_sha2_password` is the default login plugin and `mysql_native_password` is disabled by default, so do not depend on it. Strict SQL mode and `ONLY_FULL_GROUP_BY` are on. Binary logging is on, which enables point-in-time recovery.
7. **Windows-friendly tooling.** All npm scripts must be cross-platform (no bash-only syntax). Add `.gitattributes` with `* text=auto eol=lf`. Use `.nvmrc` and `engines` to pin Node.js. Local operations scripts may be PowerShell; server scripts are bash.

| Environment | MySQL | Purpose |
| --- | --- | --- |
| Local development | Native Windows service MySQL84 | Day-to-day work, databases `sms_dev` and `sms_test*` |
| CI | `mysql:8.4` service container on Linux, fresh per run | Integration and end-to-end tests, migration-from-empty check |
| Staging and production | MySQL 8.4 on the institution’s server (Linux expected) | Pre-release verification, live use |

## 3. Architecture

### 3.1 Layers

| Layer | Responsibility |
| --- | --- |
| Browser | Responsive web UI |
| Frontend (Next.js) | Routing, rendering, typed API client. No business rules |
| API (Express) | Authentication, authorization, validation, business rules, transactions, auditing |
| Data access (Knex repositories) | Parameterized SQL only, owned per module |
| MySQL 8.4 | System of record. Constraints enforce integrity as a second line of defence |
| File storage | Behind a storage adapter, local disk first |

Business rules live in the API services. Database constraints back them up. Frontend validation is a convenience and is never trusted.

### 3.2 Repository layout

The master plan’s structure, plus a `shared/` workspace (**proposed**) for Zod schemas, types and permission constants used by both sides.

```text
student-management-system/
  frontend/      Next.js app, one folder per module under src/modules/<slug>/
  backend/       Express API, one folder per module under src/modules/<slug>/
  shared/        Zod schemas, types, permission constants (npm workspace)
  database/      migrations/, seeds/, scripts/
  docs/          modules/NN-slug/ (8 files each), orchestration/, ops/
  tests/         E2E and cross-module tests
  scripts/       cross-platform dev and CI scripts
  .env.example  .gitignore  .gitattributes  .nvmrc  README.md  LICENSE
```

### 3.3 Module anatomy and extension points

Every backend module contains `manifest`, `routes`, `controller`, `service`, `repository`, `schemas`, `permissions` and `tests`. Every frontend module contains `manifest`, `routes`, `components`, `api` and `tests`.

Two dependency rules keep frozen modules frozen:

- A module **writes only to its own tables**. It may reference other modules’ tables through foreign keys and may call their public service functions, never their repositories.
- A module **never edits an earlier module to appear in it**. It registers through extension points instead (decision ADR-002).

| Registry | Used by |
| --- | --- |
| Navigation and module cards | App shell (V1), every module |
| Student profile tabs | V5 profile; attendance, marks, fees, documents, exams add their own tab |
| Dashboard widgets | V32 |
| Search providers | V33 |
| Notification types | V30 |
| Report types | V31 |
| Audit event types | V38 |
| Permissions | V3 |

Registries are generated at build time from each module’s manifest, so there is no runtime plugin loading.

### 3.3.1 Request lifecycle

Request ID, rate limit, session, CSRF check, permission check, input validation, service call (one transaction, audit record written in the same transaction), repository, response envelope, central error mapper.

## 4. Technology stack (default, pending ADR-000)

Every choice is on the master plan’s free and open-source list. Pin exact versions at the planning gate: use the current Active LTS of Node.js and the current stable releases of the others, and commit lockfiles.

| Area | Choice | Why |
| --- | --- | --- |
| Frontend | Next.js, React, TypeScript (strict), Tailwind CSS, Lucide icons | Mature, accessible component ecosystem |
| Forms and validation | react-hook-form with shared Zod schemas | One validation definition for both sides |
| Backend | Node.js, Express, TypeScript (strict) | Same language end to end |
| Database access | mysql2 driver with Knex (query builder and migrations), **no ORM** (ADR-003) | Explicit parameterized SQL, easy use of MySQL features such as row locks and generated columns |
| Authentication | Argon2id hashing, server-side sessions in MySQL, httpOnly cookie | Revocable sessions, no tokens in browser storage |
| API contract | OpenAPI 3.1 generated from the Zod schemas | Docs cannot drift from code |
| Logging | pino, structured JSON | Cheap, parseable, redactable |
| Testing | Vitest, Testing Library, supertest, Playwright, axe-core | Matches the plan’s testing pyramid |
| Static checks | ESLint, Prettier, `tsc --noEmit`, gitleaks, `npm audit` | Early failure |
| CI | GitHub Actions with a MySQL 8.4 service container | Plan §71 |

## 5. Database requirements

### 5.1 Conventions

| Topic | Rule |
| --- | --- |
| Engine and charset | InnoDB only. `utf8mb4` with the server default collation `utf8mb4_0900_ai_ci` |
| Names | Lowercase snake\_case, plural table names, no reserved words |
| Primary keys | `BIGINT UNSIGNED AUTO_INCREMENT`. Business identifiers (student number, admission number, employee ID) are separate columns with unique indexes, normalised to upper case on write |
| Foreign keys | Always declared. `ON DELETE RESTRICT` by default. Cascades only for pure child rows (for example ticket comments) and never for student, marks, payment or audit data |
| Deletion | Soft: `status` or `deleted_at`. Students are never hard-deleted (BR-02) |
| Audit fields | `created_at`, `updated_at`, `created_by`, `updated_by` on every domain table |
| Dates and times | `DATE` for calendar dates. Instants as `DATETIME(3)` stored in UTC, with the driver set to UTC. Avoid `TIMESTAMP` (2038 limit and implicit zone conversion) |
| Money | `DECIMAL(12,2)`. Never `FLOAT` or `DOUBLE`. Arithmetic in application code uses integer minor units |
| Small value sets | Lookup tables, or `VARCHAR` plus `CHECK`. No `ENUM`, because changing it needs a table alteration |
| Integrity rules | `CHECK` constraints (enforced since MySQL 8.0.16) for rules such as marks at least 0 and capacity above 0 |
| JSON columns | Only for configuration blobs (settings, certificate templates), never for data that is filtered or joined |
| Indexes | On every foreign key and on each common filter, sort and search column. Each list query is reviewed with `EXPLAIN` |
| Schema changes | Versioned Knex migrations only, each with `up` and `down`. Never a manual change to a shared or production database |

### 5.2 Core data model (indicative)

| Domain | Main tables |
| --- | --- |
| Platform | users, roles, permissions, role\_permissions, user\_roles, sessions, settings, audit\_logs, sequences |
| Academic structure | departments, courses, subjects, course\_subjects, academic\_years, semesters, classes, sections, rooms |
| People | students, guardians, student\_guardians, teachers, teacher\_assignments |
| Enrollment | enrollments, enrollment\_history, section\_allocations |
| Attendance and timetable | attendance\_sessions, attendance\_records, timetable\_slots |
| Assessment | exams, marks, grade\_scales, grade\_boundaries, results |
| Content | assignments, assignment\_submissions, study\_materials, files, student\_documents |
| Finance | fee\_structures, fee\_items, student\_fees, adjustments, payments, receipts |
| Campus | books, book\_copies, book\_issues, routes, vehicles, drivers, stops, transport\_assignments, hostel\_buildings, hostel\_rooms, hostel\_beds, hostel\_allocations |
| Communication and support | announcements, messages, notifications, tickets, ticket\_comments |
| Documents | id\_cards, certificate\_templates, certificates |

Key uniqueness and integrity points:

- `attendance_records`: unique on (`session_id`, `student_id`). Unique session key follows the answer to PRD Open Question 3.
- At most one active row, enforced in the database. MySQL has no partial unique index, so use a **generated column plus a unique index**: for example `active_bed_key` is `bed_id` while `released_at IS NULL` and `NULL` otherwise, with a unique index on it. Use the same pattern for one primary guardian per student and one active semester.
- Grade results store the `grade_scale` version used (BR-07).
- `payments` and `audit_logs` are append-only (BR-09, FR-70).

### 5.3 Transactions and concurrency

- Default isolation is REPEATABLE READ. Keep transactions short and always acquire locks in a consistent order.
- **Capacity checks** (section seats, library copies, hostel beds): inside one transaction, `SELECT … FOR UPDATE` the parent row before inserting.
- **Gap-free numbers** (receipts, certificates, ID cards): take the next value from a `sequences` row locked with `FOR UPDATE` inside the same transaction as the insert. Do not use `AUTO_INCREMENT`, which leaves gaps after rollbacks.
- **Concurrent edits** (marks, profile data): an integer `version` column and `UPDATE … WHERE id = ? AND version = ?`. Zero rows updated returns 409 Conflict.
- A single wrapper retries deadlocks (error 1213) and lock timeouts a bounded number of times.
- The audit record is written in the same transaction as the change.

### 5.4 Accounts and bootstrap

Never use `root` in application configuration. Three accounts, separated by duty:

| Account | Used by | Privileges |
| --- | --- | --- |
| Your existing administrative account | You, once, to run the script below | Administrative |
| sms\_migrator | `npm run migrate` only | DDL and DML on the SMS databases |
| sms\_app | The running API | `SELECT, INSERT, UPDATE, DELETE` on the SMS databases. After migrations, restrict `audit_logs` and `payments` to `SELECT, INSERT` |

Run once in MySQL Shell (SQL mode) or Workbench as an administrative account. Replace the placeholders with strong, unique passwords stored only in your untracked `.env`.

```sql
CREATE DATABASE IF NOT EXISTS sms_dev
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS sms_test
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

CREATE USER IF NOT EXISTS 'sms_migrator'@'localhost' IDENTIFIED BY '<strong-password-1>';
CREATE USER IF NOT EXISTS 'sms_app'@'localhost'      IDENTIFIED BY '<strong-password-2>';

-- sms_test% also matches per-worker test schemas such as sms_test_1
GRANT ALL PRIVILEGES ON sms_dev.*        TO 'sms_migrator'@'localhost';
GRANT ALL PRIVILEGES ON `sms\_test%`.*   TO 'sms_migrator'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON sms_dev.*      TO 'sms_app'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON `sms\_test%`.* TO 'sms_app'@'localhost';
```

If a connection to 127.0.0.1 is refused as “access denied”, create the same accounts for host `127.0.0.1` as well. Minimum `.env.example` keys: `NODE_ENV`, `APP_BASE_URL`, `API_PORT`, `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_NAME`, `DB_APP_USER`, `DB_APP_PASSWORD`, `DB_MIGRATOR_USER`, `DB_MIGRATOR_PASSWORD`, `SESSION_SECRET`, `STORAGE_DIR`. The app validates all of them at startup and refuses to start if any is missing.

## 6. API requirements

| Topic | Requirement |
| --- | --- |
| Base path | `/api/v1`, JSON over HTTPS, plural kebab-case nouns |
| Success | `{ "success": true, "data": …, "message": "…" }`. Lists add `meta` with `page`, `pageSize`, `total`, `totalPages` |
| Errors | `{ "success": false, "error": { "code", "message", "details": [{ "field", "issue" }], "requestId" } }`. Messages say how to recover |
| Status codes | 400 validation, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict, 413 too large, 429 rate limited, 500 server error, 503 database unavailable |
| Pagination | `page` (from 1), `pageSize` (default 20, maximum 100). Keyset pagination for very large tables such as attendance and audit logs |
| Sorting and filtering | Whitelisted fields only. `sort=lastName,-createdAt`, `q` for search |
| Time and dates | ISO 8601 UTC for instants, `YYYY-MM-DD` for dates |
| Idempotency | `Idempotency-Key` header on payment creation and import confirmation |
| Tracing | `X-Request-Id` accepted or generated, echoed in the response and in every log line |
| Rate limiting | Global per client, stricter on authentication routes. Single-instance in-memory store at first; a MySQL-backed store if more than one API instance runs (ADR-007) |
| Documentation | OpenAPI 3.1 generated from Zod, available outside production and behind authentication in production |
| Bulk operations | Attendance and marks bulk endpoints define whether a batch is atomic. Default: atomic, with per-row error details |

## 7. Security requirements

Basic security is in place from V2. V41 is a dedicated review, not the first look.

| Area | Requirement |
| --- | --- |
| Passwords | Argon2id at or above the OWASP minimum parameters, tuned to about 250 ms on the production host. Minimum 10 characters, block common passwords, no forced periodic rotation. Generic login errors to prevent account enumeration |
| Sessions | Random token in an httpOnly, SameSite=Lax cookie (Secure and `__Host-` prefixed in production). Only a SHA-256 hash is stored in `sessions`. Idle timeout 30 minutes, absolute timeout 8 hours (**proposed**). Rotate on login and on role change. Revoke on disable |
| Login abuse | Progressive delay and temporary lockout after repeated failures, per account and per client address |
| CSRF | SameSite plus a custom-header token on state-changing requests, and an `Origin` check |
| Authorization | Deny by default. One central policy function: permission (resource plus action) and ownership scope. Scope is applied **in the SQL `WHERE` clause**, not by filtering results afterwards |
| Authorization testing | A matrix is generated from the route registry times all six roles. CI fails if any endpoint is missing from it |
| Input and output | Zod validation on every input. Parameterized queries only, no string-built SQL. Output encoding by the framework. No `dangerouslySetInnerHTML` without review |
| File uploads | Allowlist by extension and sniffed content type, size limit (default 10 MB, **proposed**), random storage names, stored outside any public path, served only through an authorized endpoint, never executed. Optional virus-scan hook |
| Headers | Content-Security-Policy without inline scripts, HSTS in production, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `frame-ancestors 'none'`. CORS: same-origin by default, explicit allowlist otherwise |
| Secrets | Environment variables only, validated at startup, separate per environment, rotation procedure documented, gitleaks in CI |
| Logging | Structured logs with passwords, tokens and cookies redacted. No personal data beyond identifiers. The audit log is separate from application logs |
| Audit | Written in the same transaction as the change. The application account cannot update or delete audit rows |
| Dependencies | Lockfile committed, `npm audit` and Dependabot in CI, high or critical findings block freeze |
| Data protection | Minimal collection, encrypted backups, access to personal data is logged |

## 8. Frontend requirements

- **One design system:** Tailwind tokens, accessible headless primitives, and the component set from the master plan (button, input, select, checkbox, radio, table, card, modal, drawer, tabs, badge, toast, alert, pagination, breadcrumb, dropdown). Modules must not restyle components.
- **Every state handled** through one shared data-state wrapper: loading, success, empty, validation error, authentication error, authorization error, network error, server error, database error, not found, conflict. Server field errors map onto form fields.
- **Responsive:** mobile-first, breakpoints at 640, 768, 1024 and 1280 px. The sidebar becomes a drawer below 1024 px. Wide tables scroll horizontally with a sticky first column, or become stacked cards on phones.
- **Accessibility (WCAG 2.2 AA):** semantic HTML, visible focus, skip link, labelled inputs with errors tied through `aria-describedby`, contrast of at least 4.5:1, touch targets of at least 24 by 24 CSS pixels, full keyboard operation, focus trapped in modals and returned on close. ARIA only where native elements cannot do the job.
- **Not in scope:** service workers, offline storage, install prompts, push.

## 9. Quality engineering and CI

| Layer | Tooling | Rule |
| --- | --- | --- |
| Static | ESLint, Prettier, `tsc --noEmit`, gitleaks | Zero errors |
| Unit | Vitest | At least 80% line coverage on services (**proposed**) |
| API and integration | Vitest and supertest against **real MySQL 8.4** | Each endpoint has a success, a validation-failure and an authorization-failure test |
| Component | Vitest and Testing Library | All states of each shared component |
| End to end | Playwright on Chromium, Firefox and WebKit, plus axe-core on every route | One happy and one failure path per module, plus persona walkthroughs for acceptance |
| Authorization matrix | Generated | 100% of endpoints |

WebKit is a stand-in for Safari. Real Safari, real devices and a screen-reader pass (NVDA is free on Windows) are human tasks recorded in V43 and V44.

**Test database strategy.** Migrate once per run. Each test worker gets its own schema (`sms_test_1`, `sms_test_2`, and so on) so workers cannot collide. Tests use fixtures built from seeds, and never share state between files.

**Pipeline (plan §71):** install, lint, typecheck, unit, integration against a MySQL 8.4 service container (wait for its health check), build, end to end, deploy. Two extra jobs: **migrate from empty then roll back the latest migration**, and **dependency and secret scan**. A module cannot freeze if any stage fails.

## 10. Performance and capacity

Targets come from PRD section 9 and are measured in V42. The method matters as much as the number:

- Seed a realistic data set: at least 10,000 students and a full academic year of attendance, which is several million rows.
- Review every list query with `EXPLAIN`. Add indexes for the real filter and sort columns. Consider partitioning only if measurement shows a need.
- Connection pool of 10 to 20 per API instance. Default `max_connections` is enough at design capacity.
- Enable the slow query log (`long_query_time` of 0.5 s in test, 1 s in production).
- Load test with a free tool such as k6. Record results in `docs/ops/performance.md`.

## 11. Backup and recovery

A backup is only real once a restore has been verified.

| Topic | Requirement |
| --- | --- |
| Full backup | Daily logical backup. `mysqldump --single-transaction --routines --triggers --events` (consistent because all tables are InnoDB), or MySQL Shell `util.dumpSchemas()`, which dumps in parallel and restores with `util.loadDump()` |
| Credentials | Use `mysql_config_editor` or an option file. Never a password on the command line |
| Point-in-time recovery | Keep binary logs and set retention explicitly (`binlog_expire_logs_seconds`). Restore the last full dump, then replay logs with `mysqlbinlog` to the chosen moment |
| Off-machine copy | Binary logs and dumps live on the same disk as the data, so copy them to a second location. Encrypt dumps at rest |
| Retention (**proposed**) | 14 daily, 8 weekly, 12 monthly |
| Restore test | Restore into a scratch schema, compare table row counts to a manifest, run foreign-key checks, run a login and student-list smoke test, and log the result in `docs/ops/restore-log.md`. Do this monthly, and before V40 and V49 are frozen |
| Scheduling | Windows Task Scheduler on the development machine, a systemd timer or cron on servers |
| Targets | RPO 15 minutes, RTO 4 hours (PRD section 9) |

## 12. Deployment and operations

```text
Internet -> HTTPS reverse proxy (Caddy or Nginx) -> Next.js and Express API -> MySQL 8.4 + file storage
```

- **Process model:** Docker Compose or systemd units. The reverse proxy terminates HTTPS. MySQL is never exposed to the internet.
- **Migrations:** run as a separate step with the `sms_migrator` account before the new API version starts.
- **Rollback:** migrations follow expand then contract, so the previous application version still works with the new schema for one release. Rollback is then “redeploy the previous tag”. Restore from backup only if a migration cannot be reversed.
- **Health:** `GET /health` returns `{ "status", "database", "version" }` where `version` is the application version only. A readiness check confirms the database. No hostnames, accounts or MySQL versions are exposed.
- **Monitoring:** structured logs, error tracking, uptime checks, and MySQL watch items (connections, slow queries, disk space on the data volume, replication or backup age). Candidate free tools: Uptime Kuma, Sentry free tier, Prometheus with Grafana. **Verify current free-tier limits before relying on any hosted service.**
- **Hosting:** the baseline is self-hosted MySQL Community Edition. Free managed MySQL offerings are scarce and change often. Supabase and Neon are PostgreSQL and are not used.

## 13. Delivery rules for parallel work

These rules apply to people and to agents alike.

- Each module has a **contract** (requirements, API spec, database spec, UI states, permission matrix, integration contract, threat model) that is approved and frozen before build agents start. A contract change restarts affected work.
- Each specialist owns specific paths. Shared files (route and navigation registries, migration index, `package.json`, lockfiles, CI) change only through the integrator.
- Migrations are timestamp-prefixed and module-scoped. Every merge runs the whole chain from an empty MySQL, then a rollback.
- Each module has `docs/modules/NN-slug/` with README, REQUIREMENTS, ARCHITECTURE, API, DATABASE, TESTING, SECURITY and CHANGELOG. Global documents: ARCHITECTURE, DATABASE, API, SECURITY, DEPLOYMENT, TESTING, CONTRIBUTING, CHANGELOG, LICENSE.
- Git: `main`, `develop`, `feature/vN-<slug>`. Tag on freeze, for example `v4.0.0-student-management`. Frozen modules change only through change request, impact analysis, approval, regression and a patch tag.
- A module is done only when the master plan’s Definition of Done is complete with evidence.

## 14. Technical risks

| Risk | Mitigation |
| --- | --- |
| Windows and Linux differ in table-name case | Lowercase snake\_case rule, CI on Linux |
| Driver and authentication plugin mismatch on MySQL 8.4 | Prove the mysql2 connection with `caching_sha2_password` in V0 |
| Parallel migrations collide | Timestamp and module prefixes, chain test on every merge |
| Attendance tables grow to millions of rows | Right indexes, keyset pagination, load test in V42 |
| Backups share a disk with the data | Mandatory off-machine copy and monthly restore test |
| Free hosting lacks MySQL | Self-hosted baseline, verify offers before V47 |
| In-memory rate limits and single-instance assumptions break when scaling | ADR-007: MySQL-backed store before adding instances |
| Hardening in V41 to V44 touches frozen modules | Parallel audits, serialized patch versions |

## 15. Decisions to approve

| ID | Decision | Recommendation |
| --- | --- | --- |
| ADR-000 | Technology stack | Section 4 defaults |
| ADR-001 | Build order: V7, V10, V8 before V4, because student records reference them | Adopt, instead of nullable unconstrained columns patched later |
| ADR-002 | Extension-point registries built in V0 and V1 | Adopt |
| ADR-003 | Query builder (Knex), not an ORM | Adopt |
| ADR-004 | File storage behind an adapter, local disk first, S3-compatible later | Adopt |
| ADR-005 | PDF generation: library-based or headless browser | Decide in the V25 contract; prefer a library to avoid shipping a browser to production |
| ADR-006 | Server-side sessions in MySQL | Adopt |
| ADR-007 | Rate-limit store: in memory, then MySQL-backed for multiple instances | Adopt |
