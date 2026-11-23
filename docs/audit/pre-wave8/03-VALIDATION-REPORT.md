# Validation Report

| Check | Result | Evidence / limitation |
|---|---|---|
| `npm ci` baseline | PASS with warnings | At initial install, 209 packages installed; npm reported 7 advisories (3 moderate, 2 high, 2 critical) and an esbuild install-script approval warning. The later dependency upgrades clear the advisories per the current audit row below. |
| `npm ci` after dependency remediation | PASS (0 advisories) | Clean install from the updated lockfile completed; npm still warns that the esbuild postinstall script is not approved by local install-script policy. |
| `npm audit --json` after dependency remediation | PASS (0 advisories) | Upgraded Vitest 2→5.1.1 and Zod 3→4.6.7; updated Zod error formatting for v4. Both production and development dependency audit reports are clear. |
| GitHub Actions CI and full-history Gitleaks | PARTIAL | Gitleaks passed in all six runs. Runs 3–6 passed locked install, lint, typecheck, build, audit, MySQL 8.4 migration/rollback/reapply, and isolated scratch provisioning. Full suite reached 114/115 because backup restore returns 422. Safe diagnostics traced this to `ER_PARSE_ERROR` on SQL statement 5 (`INSERT_INTO:audit_logs`): mysql2 returns JSON objects that must be serialized as scalar JSON text before raw SQL binding. The serializer fix and unit test pass locally; a seventh remote run must verify restore and the full suite. |
| `npm run typecheck` | PASS | Reran across shared, backend, and frontend after current edits. |
| `npm run lint` | PASS | Reran across shared, backend, and frontend; zero errors or warnings. |
| `npm run build` | PASS | Reran across shared, backend, and frontend after current edits. |
| Audit migration target guard | PASS (negative check) | `DB_TEST_NAME=sms_test npm run db:migrate:audit-test --workspace=backend` failed immediately with the `sms_audit_*` guard before creating a Knex connection. |
| `npm run test:unit --workspace=backend` | PASS (39/39) | Ten DB-independent files cover service DB-error propagation, error mapping/redaction, Express async forwarding, SQL dump serialization/manifests and JSON scalar bindings, Argon2id and legacy scrypt migration, rate limiting, CSRF checks, student object-level read authorization, and runtime configuration. Ran with `NODE_ENV=test` / `DB_TEST_NAME=sms_audit_unit`; no DB connection. |
| Frontend inline-script syntax parse | PASS | Parsed all inline scripts from `frontend/public/index.html` with Node's VM parser; one inline script found. This is syntax-only, not browser behavior or accessibility validation. |
| `git diff --check` | PASS | No whitespace errors; Git emitted only its configured LF-to-CRLF working-copy notices. |
| Baseline full `npm test` | PASS, DB assurance incomplete | Original code: 12 files / 76 tests. Closed-port injection exposed that most passed through memory fallback paths (75 passed, 1 failed). |
| Closed-port DB-down injection, original harness | FAIL (75 passed, 1 failed) | `DB_HOST=127.0.0.1 DB_PORT=1 npm test`: swallowed setup error, 11 files passed, 1 failed because fallback student lacked `departmentName`. MySQL was not stopped. |
| Closed-port DB-down injection, prior setup guard | PASS (expected suite failure) | Earlier targeted health suite failed at setup; two tests were skipped, exit code 1. MySQL was not stopped. |
| Current service fallback scan | PASS (static) | `rg -n -i "in.?memory|memory fallback" backend/src/services backend/src/db` returns no matches. All service methods now propagate database errors; 10 service families have DB-down regression coverage. |
| Current integration-test database guard | PASS (unit/config) | `createAppConfig` defaults test runs to `sms_audit_test`, rejects any non-`sms_audit_*` `DB_TEST_NAME`, and skips dotenv loading in `NODE_ENV=test`; `tests/setup.ts` confirms the connected schema prefix before deleting data. |
| Full DB suite twice + shuffled | BLOCKED | No authenticated dedicated MySQL 8.4 audit schema is available. Never targeted `sms_test`; no destructive DB operation was attempted. |
| Migrate empty / rollback / migrate | BLOCKED | Requires authenticated dedicated audit scratch schema. |
| Backup restore to isolated scratch | BLOCKED | SQL writer/parser and row-manifest checks pass DB-independent tests; no real MySQL dump or restore could run without the provisioned source/restore scratch schemas. API now requires a distinct pre-provisioned `sms_audit_*` target and does not claim simulation success. |
| Fallback removal / 15 mutation checks | BLOCKED | Static scan and representative failing-first tests are complete; prompt-required isolated mutations need scratch DB/worktree validation. |
| Authorization matrix | PARTIAL / BLOCKED | Unit checks cover student self-scoping, parent denial, and teacher access; full route-by-role integration matrix still requires functioning audit DB and all role fixtures. |
| Playwright + axe at 375/768/1024/1440 | BLOCKED | Browser tooling and authenticated scratch API are unavailable. Static review removed browser token storage/JSON exposure and escapes API data interpolated into HTML. No viewport/a11y pass rate is claimed. |
| `EXPLAIN ANALYZE` at target scale | BLOCKED | No authenticated audit/performance instance. |
| Git history/tag inventory | PASS (partial scope) | Full clone; 12 expected tags resolve to expected wave commits; local audit branch exists. Frozen-module path-level audit remains incomplete. |
| Secret scan entire Git history | PASS | Pinned Gitleaks v3 with full-history checkout passed in all six GitHub Actions runs through `45127505591`. No secret/PII value was copied into reports. |

No check is reported passed unless its command ran successfully as listed. Source fixes are committed on `audit/pre-wave8`, but database and browser evidence remains blocked; findings are not marked `FIXED+VALIDATED` until their required validation passes.
