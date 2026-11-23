# Pre-Wave-8 Audit — Baseline

Date: 2026-11-23 (Asia/Calcutta)
Repository path: `D:\CampusCore`
Audit prompt: `CC-AUDIT-PRE-W8` with overlay `CC-AUDIT-PRE-W8-MA`

## Execution constraints

- NDA pre-flight: `Mutual Non-Disclosure Agreement.md` has a placeholder-only Schedule 2; Codex is not listed. Per NDA §6 and audit §2.9, no project content may be sent to external AI agents. The audit proceeded locally and sequentially; no sub-agents or external services were used.
- Git was found at `C:\Users\SANDY\AppData\Local\Programs\MinGit\cmd\git.exe` (not on PATH). This is a full clone (`rev-parse --is-shallow-repository`: `false`); initial branch was `main`, HEAD `cb1ffbe`, and all 12 expected version tags exist. A local `audit/pre-wave8` branch has now been created; no commits or pushes were made. The working tree contains the two supplied audit prompts and `docs/audit/` as untracked files.
- Windows service `MySQL84` is Running (Automatic). Direct CLI login as `sms_app` without a password failed with `ERROR 1045`; no credential was read or copied. Exact server version and access to a dedicated `sms_audit` scratch schema remain unverified, so scratch DB-dependent checks are BLOCKED.
- Docker and gitleaks executables are unavailable. No Playwright/axe dependencies or CI workflows were found in the repository inventory.
- Initial `npm ci` completed: 209 packages added; npm reported 7 vulnerabilities (3 moderate, 2 high, 2 critical). It also warned that esbuild install scripts were not approved. No detailed `npm audit` ran during baseline; current audit results are recorded below.

## Repository and commands

- Package manager: npm workspaces `shared`, `backend`, `frontend`; lockfile present.
- `npm run typecheck`: PASS; `tsc --noEmit` ran in shared, backend, frontend.
- Baseline `npm run lint` was a no-op. Remediation added ESLint scripts; the current lint run passes in shared, backend, and frontend (see `03-VALIDATION-REPORT.md`).
- `npm run build`: PASS; TypeScript builds ran in all three workspaces.
- `npm test`: PASS before the harness change, 12 test files / 76 tests, 0 failures. Closed-port failure injection (`DB_HOST=127.0.0.1`, `DB_PORT=1`) on the original code logged `SETUP DB SEED ERROR`, then ran 12 files: 11 passed, 1 failed; 75 tests passed, 1 failed. Most tests therefore exercised fallbacks, while the suite did not report an overall green result with DB unavailable.
- No `.env` contents were inspected or copied. Runtime test configuration now skips dotenv loading, defaults tests to `sms_audit_test`, and rejects non-`sms_audit_*` test databases before destructive setup. `.env.example` no longer declares an unused `SESSION_SECRET`; `STORAGE_DIR` is read at runtime.
- Uncommitted remediation removes all service memory fallbacks, adds shared error/async handling, config validation and a Node pin, real lint gates, Argon2id with scrypt upgrade, login throttling, origin/header CSRF checks, cookie-only browser auth, escaped API markup, and a streamed backup/isolated restore path. DB-independent unit checks pass; full MySQL validation remains outstanding.

## Documentation facts and discrepancies

- Read `SESSION.md`, root and docs Master Plan copies, PRD, TRD, orchestration prompt, STATUS, LOG tail, DAG, WAVES, and ADR-000 through ADR-002.
- ADR-000, ADR-001, ADR-002 remain `Proposed`; no recorded Gate 0 human approval was identified in inspected orchestration docs.
- STATUS and LOG say Wave 7 is complete and 12 modules are frozen. SESSION's older handoff says Wave 5 is current and Wave 6 next.
- STATUS/WAVES labels for V44–V48 conflict with the Master Plan, which is the scope authority. Decision Request required.
- WAVES specifies SQL migration filenames with slug; actual files are timestamped `.ts` Knex migrations.
- All 12 expected tags are present. Resolved commits: `v0.0.0-foundation` cf79119; `v1.0.0-shell` 15f824a; `v2.0.0-auth` b884073; `v3.0.0-users` 8958fe2; `v7.0.0-departments`, `v10.0.0-academic-years`, `v38.0.0-audit-logs` 6aec5e8; `v8.0.0-courses`, `v39.0.0-system-settings` c2709cb; `v4.0.0-students`, `v9.0.0-subjects`, `v40.0.0-backup-recovery` cb1ffbe. HEAD is cb1ffbe.
- PowerShell content comparison of `STUDENT_MANAGEMENT_SYSTEM_MASTER_PLAN_UPDATED.md` and `docs/MASTER_PLAN.md` returned identical (`True`).

## Runtime inventory

- Node.js v26.13.1 and npm are installed. `mysql.exe`, `mysqld.exe`, and `mysqldump.exe` exist under MySQL Server 8.4. The initial snapshot had no Node runtime pin; remediation has since added `.nvmrc` and `engines` for Node 26.13.1.
- The initial root lint script used `--if-present`, masking absent workspace lint scripts. Remediation now invokes ESLint in every workspace; `npm run lint` currently passes.
- Frontend workspace is a TypeScript static server with one large `frontend/public/index.html`; this differs from the proposed Next.js/React/Tailwind stack in ADR-000/TRD. Treat as a Decision Request, not an implementation task.
- Backend route registration is in `backend/src/app.ts`; all mounted API routers use `/api/v1` except health aliases `/health` and `/api/v1/health`.
- Baseline static inspection counted 23 `innerHTML` occurrences and localStorage token writes/reads. Current UI no longer stores or returns bearer tokens; API-derived markup values are escaped. Browser/axe validation remains blocked.
- Database schema consists of six Knex TypeScript migrations in `database/migrations/`; exact server version and audited scratch schema were not checked because no dedicated `sms_audit` credentials were available.

## Initial assumptions

- Use the Master Plan as roadmap authority as directed by the audit prompt and SESSION.
- Treat unavailable dedicated MySQL audit access as a blocker, not evidence of clean state.
- Treat all generated test personas/data in the repository as synthetic unless a secret/real personal data is proven; do not reproduce suspected sensitive values in reports.
- Do not start Wave 8 work.

## Key command evidence

```text
Get-Command git: NOT FOUND; MinGit located at C:\Users\SANDY\AppData\Local\Programs\MinGit\cmd\git.exe
git rev-parse --is-shallow-repository: false
git switch -c audit/pre-wave8: succeeded
git tag --list: 12 tags present and resolved to expected wave commits
Get-Service MySQL84: Running, Automatic
npm ci: added 209 packages; audited 213; 7 vulnerabilities (3 moderate, 2 high, 2 critical)
npm run typecheck: shared, backend, frontend all ran successfully
npm run lint: no workspace lint script ran
npm run build: shared, backend, frontend all ran successfully
npm test: Test Files 12 passed (12); Tests 76 passed (76)
Closed-port injection on original code: Test Files 11 passed, 1 failed; Tests 75 passed, 1 failed
Closed-port injection after setup fix: health.test.ts suite failed at setup; 2 tests skipped; exit code 1
mysql --protocol=TCP --host=127.0.0.1 --port=3306 --user=sms_app --execute="SELECT VERSION()":
  ERROR 1045 (28000): Access denied for user 'sms_app'@'localhost' (using password: NO)
```

## Current remediation verification (2026-11-23)

After the source changes and dependency remediation, the DB-independent suite passes 27/27 across eight files; typecheck, lint, build, inline-script syntax parsing, and `git diff --check` pass. `npm audit --json` reports zero advisories after upgrading Vitest to 5.1.1 and Zod to 4.6.7. These results supersede the earlier in-progress counts above. Dedicated MySQL 8.4 validation and browser/axe validation remain blocked; no finding is marked fixed and validated.
