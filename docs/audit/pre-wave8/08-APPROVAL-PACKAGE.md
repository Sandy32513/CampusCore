# Gate A8 Approval Package

## 1. Verdict

**NOT READY.** The audit found 2 Critical and 14 High findings. `CC-F-202` (backup/restore), `CC-F-203` (test integrity), and `CC-F-601` (CI/secret-scanning gates) are `FIXED+VALIDATED`; other findings remain partial, blocked, or open. Authorization mutation tests, browser, performance, and governance evidence is incomplete. Do not start Wave 8.

## 2. Scoreboard

| Severity | Found | Fixed + validated | Partial remediation | Blocked / open | Backlog |
|---|---:|---:|---:|---:|---:|
| Critical | 2 | 1 | 1 | 1 | 0 |
| High | 14 | 2 | 8 | 12 | 0 |
| Medium | 3 | 0 | 0 | 2 | 1 |
| Low | 0 | 0 | 0 | 0 | 0 |

Counts in the “Blocked / open” column are not additive to partial remediation. Medium findings include one decision request, one open governance item, and one backlog item.

## 3. Highest-impact findings

CC-F-201 (service DB failure behavior), CC-F-301 (password hashing migration), CC-F-302/501 (browser auth and markup safety), CC-F-303 (request security), and CC-F-205 (async error propagation) have source-level changes and remain partial pending further evidence. CC-F-202 backup/restore, CC-F-203 test integrity, and CC-F-601 CI/secret-scanning controls passed their validation gates in `45131257677`.

## 4. Validation summary

| Check | Result | Evidence |
|---|---|---|
| `npm ci` baseline | PASS with warnings | Initial install reported 7 advisories; current `npm audit` is clear after the dependency upgrades below. |
| `npm ci` after dependency remediation | PASS | Clean install from the lockfile; zero advisories. npm notes esbuild postinstall is not approved by local install-script policy. |
| `npm run typecheck` | PASS | Shared, backend, and frontend. |
| `npm run lint` | PASS | Real ESLint runs in all three workspaces with zero errors/warnings. |
| `npm run build` | PASS | Shared, backend, and frontend. |
| Audit migration target guard | PASS (negative check) | `sms_test` is rejected before a database connection is opened. |
| `npm audit --json` | PASS (0 advisories) | Vitest upgraded to 5.1.1 and Zod to 4.6.7; production and development dependency audit clear. |
| GitHub Actions CI / Gitleaks | PASS | Run `45131257677`: both jobs passed. Lint, typecheck, build, audit, migration rollback/reapply, isolated scratch provisioning, and full-history Gitleaks passed; MySQL 8.4 full suite passed twice and in seeded shuffled order (22 files / 116 tests each). |
| DB-independent unit tests | PASS (39/39) | Ten files; `NODE_ENV=test`, `DB_TEST_NAME=sms_audit_unit`; no DB connection. |
| Frontend inline syntax | PASS | One inline script parsed with Node VM; no browser behavior tested. |
| `git diff --check` | PASS | No whitespace errors. |
| Full DB suite twice + shuffled | PASS | Run `45131257677` passed 22 files / 116 tests in each of two standard runs and one seeded test-order shuffle. |
| Migrations and rollback | PASS | Run `45131257677` migrated MySQL 8.4.13, rolled back the latest migration, and reapplied it. |
| Real backup dump and isolated restore | PASS | Run `45131257677` restored into `sms_audit_restore_v40` and passed table, row-count, and checksum verification. |
| Authorization matrix / 15 mutation checks | PARTIAL / BLOCKED | The full suite and seeded shuffle pass. Unit checks cover student self-scoping, parent denial, and teacher access; the complete route-by-role matrix and isolated mutation spot-checks remain outstanding. |
| Playwright / axe / viewport checks | BLOCKED | Tooling and authenticated audit API are unavailable. |
| Target-scale `EXPLAIN ANALYZE` | BLOCKED | No performance database or dataset. |
| Full-history Gitleaks | PASS | Pinned, full-history GitHub Actions scan passed in all eleven runs through `45131257677`. |

The historical baseline run was 76/76 before the closed-port test exposed fallback-backed success. That baseline is not evidence that the current DB-backed suite passes.

## 5. Performance

No before/after measurements exist. Synthetic dataset loading and `EXPLAIN ANALYZE` are blocked; see `04-DB-PERFORMANCE-REPORT.md`.

## 6. UI/UX and accessibility

The UI now avoids localStorage bearer-token handling and escapes API-derived markup values. Inline script syntax passes. Playwright flows, keyboard/focus review, axe, zoom, and 375/768/1024/1440 px screenshots remain blocked; see `05-UIUX-A11Y-REPORT.md`.

## 7. Residual risk

Most Critical and High findings remain open or partially remediated. The isolated MySQL backup restore, repeated/shuffled integration suite, and CI/secret scanning now pass; MySQL failure-path coverage, auth migration, browser security/accessibility, performance, and Wave 8 architecture prerequisites remain incomplete. The current npm dependency audit is clear.

## 8. Decision requests

DR-01 through DR-06 are in `06-DECISION-REQUESTS.md`: authorized audit tooling/database access, Argon2id decision record, real backup validation, roadmap/Gate 0 reconciliation, frontend stack direction, and release-gate controls.

## 9. Wave 8 readiness

**NOT READY.** See `07-WAVE8-READINESS.md`. Blockers include CC-F-201, CC-F-205, CC-F-301, CC-F-302, CC-F-303, CC-F-401, CC-F-901, CC-F-902, and CC-F-903.

## 10. Reconciliation

Audit remediation commits and patch tags through `v0.0.5-foundation` are on `audit/pre-wave8`. `STATUS.md` records 13 unresolved Critical/High findings (three of the 16 total are fixed and validated); `LOG.md` records the latest validation. ADRs, roadmap drift, and frozen-module path review remain unresolved.

## 11. Approval status

Gate A8 is **not approved**. Required DB, browser/accessibility, performance, security scanning, and governance evidence remains outstanding. Wave 8 has not been started, and this package does not authorize it.
