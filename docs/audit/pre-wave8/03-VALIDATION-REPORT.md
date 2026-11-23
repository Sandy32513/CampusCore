# Validation Report

| Check | Result | Evidence / limitation |
|---|---|---|
| `npm ci` baseline | PASS with warnings | At initial install, 209 packages installed; npm reported 7 advisories (3 moderate, 2 high, 2 critical) and an esbuild install-script approval warning. The later dependency upgrades clear the advisories per the current audit row below. |
| `npm ci` after dependency remediation | PASS (0 advisories) | Clean install from the updated lockfile completed; npm still warns that the esbuild postinstall script is not approved by local install-script policy. |
| `npm audit --json` after dependency remediation | PASS (0 advisories) | Upgraded Vitest 2→5.1.1 and Zod 3→4.6.7; updated Zod error formatting for v4. Both production and development dependency audit reports are clear. |
| GitHub Actions CI and full-history Gitleaks | PASS | Run `45165565332` passed both jobs: locked install, lint, typecheck, build, zero-advisory audit, MySQL 8.4.13 migration/rollback/reapply, isolated scratch provisioning, full backup restore/integrity flow, two standard full-suite runs and one seeded `--sequence.shuffle` run (23 files / 117 tests each), and full-history Gitleaks. |
| `npm run typecheck` | PASS | Reran across shared, backend, and frontend after current edits. |
| `npm run lint` | PASS | Reran across shared, backend, and frontend; zero errors or warnings. |
| `npm run build` | PASS | Reran across shared, backend, and frontend after current edits. |
| Audit migration target guard | PASS (negative check) | `DB_TEST_NAME=sms_test npm run db:migrate:audit-test --workspace=backend` failed immediately with the `sms_audit_*` guard before creating a Knex connection. |
| `npm run test:unit --workspace=backend` | PASS (40/40) | Eleven DB-independent files cover service DB-error propagation, error mapping/redaction, Express async forwarding, the route authorization matrix, SQL dump serialization/manifests and JSON scalar bindings, Argon2id and legacy scrypt migration, rate limiting, CSRF checks, student object-level read authorization, and runtime configuration. Ran with `NODE_ENV=test` / `DB_TEST_NAME=sms_audit_unit`; no DB connection. |
| Frontend inline-script syntax parse | PASS | Parsed all inline scripts from `frontend/public/index.html` with Node's VM parser; one inline script found. This is syntax-only, not browser behavior or accessibility validation. |
| `git diff --check` | PASS | No whitespace errors; Git emitted only its configured LF-to-CRLF working-copy notices. |
| Baseline full `npm test` | PASS, DB assurance incomplete | Original code: 12 files / 76 tests. Closed-port injection exposed that most passed through memory fallback paths (75 passed, 1 failed). |
| Closed-port DB-down injection, original harness | FAIL (75 passed, 1 failed) | `DB_HOST=127.0.0.1 DB_PORT=1 npm test`: swallowed setup error, 11 files passed, 1 failed because fallback student lacked `departmentName`. MySQL was not stopped. |
| Closed-port DB-down injection, prior setup guard | PASS (expected suite failure) | Earlier targeted health suite failed at setup; two tests were skipped, exit code 1. MySQL was not stopped. |
| Current service fallback scan | PASS (static) | `rg -n -i "in.?memory|memory fallback" backend/src/services backend/src/db` returns no matches. All service methods now propagate database errors; 10 service families have DB-down regression coverage. |
| Current integration-test database guard | PASS (unit/config) | `createAppConfig` defaults test runs to `sms_audit_test`, rejects any non-`sms_audit_*` `DB_TEST_NAME`, and skips dotenv loading in `NODE_ENV=test`; `tests/setup.ts` confirms the connected schema prefix before deleting data. |
| Full DB suite twice + shuffled | PASS | Run `45165565332` passed 23 files / 117 tests on two standard runs and on `npm exec --workspace=backend -- vitest run --sequence.shuffle --sequence.seed=20261123`, against disposable MySQL 8.4.13. |
| Migrate empty / rollback / migrate | PASS | Run `45165565332` migrated the CI schema, rolled back the latest migration, and reapplied it. |
| Backup restore to isolated scratch | PASS | Run `45165565332` created a full backup, verified its SHA-256, restored only to pre-provisioned `sms_audit_restore_v40`, and passed table/count/checksum validation. |
| Fallback source scan / service error regressions | PASS (static + unit) | Static scan finds no service memory fallback; ten service families reject injected database errors in tests. Live MySQL stop/recovery injection remains outstanding. |
| Route authorization matrix | PASS (HTTP route guards) | `backend/tests/unit/authorizationMatrix.test.ts` checked 60 route scenarios against unauthenticated access and all six roles (420 HTTP requests) on the real Express app; run `45165565332` passed it. The matrix mocks service/DB calls. |
| Authorization-guard mutation spot-checks | PASS (16/16 killed) | Removed 16 `requireRole` guards one at a time in detached worktree `D:\CampusCore-audit-mutation`; the matrix failed on the expected route/role for each mutation. Source was restored after each check; no database was used. |
| DB-backed object-level authorization | PARTIAL / BLOCKED | Unit checks verify student self-scope predicates and parent denial, but linked student/parent route results have not been validated against MySQL fixtures. |
| Playwright + axe at 375/768/1024/1440 | BLOCKED | Browser tooling and authenticated scratch API are unavailable. Static review removed browser token storage/JSON exposure and escapes API data interpolated into HTML. No viewport/a11y pass rate is claimed. |
| `EXPLAIN ANALYZE` at target scale | BLOCKED | No authenticated audit/performance instance. |
| Git history/tag inventory | PASS (partial scope) | Full clone; 12 expected tags resolve to expected wave commits; local audit branch exists. Frozen-module path-level audit remains incomplete. |
| Secret scan entire Git history | PASS | Pinned Gitleaks v3 with full-history checkout passed in run `45165565332`. No secret/PII value was copied into reports. |

No check is reported passed unless its command ran successfully as listed. Database coverage includes two standard full MySQL 8.4 runs and one seeded shuffled run, plus isolated backup restore. Live DB outage/recovery, DB-backed object-scope authorization, browser evidence, target-scale performance, and governance decisions remain outstanding. CC-F-202, CC-F-203, and CC-F-601 are marked `FIXED+VALIDATED`; other findings retain their documented partial or blocked states.
