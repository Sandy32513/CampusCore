# CampusCore — Codex Session Handoff

**Handoff date:** 2026-11-22  
**Repository:** https://github.com/Sandy32513/CampusCore  
**Default branch observed:** `main`  
**Previous coding assistant:** Antigravity  
**Next coding assistant:** OpenAI Codex  
**Purpose:** Resume the existing CampusCore Student Management System project without restarting or changing approved architecture.

> This file is a session handoff, not a replacement for the Master Plan, PRD, TRD, orchestration prompt, module contracts, or the repository's actual code. Always verify the working tree and tests before making claims.

---

## 1. First actions for Codex

1. Read this file completely.
2. Read the authoritative project documents:
   - `STUDENT_MANAGEMENT_SYSTEM_MASTER_PLAN_UPDATED.md`
   - `SMS_MULTI_AGENT_ORCHESTRATION_PROMPT.md`
   - `Student Management System (SMS) Product Requirements Document.md`
   - `Student Management System (SMS) Technical Requirements Document.md`
   - `Mutual Non-Disclosure Agreement.md`
3. Read current orchestration state:
   - `docs/orchestration/STATUS.md`
   - `docs/orchestration/LOG.md` (especially the latest entries)
   - `docs/orchestration/DAG.md`
   - `docs/orchestration/WAVES.md`
   - all applicable `docs/orchestration/DECISIONS/ADR-*.md`
4. Inspect repository reality:
   - `git status --short --branch`
   - `git branch -a`
   - `git tag --list`
   - `git log -10 --oneline --decorate`
   - inspect root/workspace manifests and actual source files.
5. Verify the available scripts in `package.json`; run install only if required and safe, then run the existing lint, typecheck, test and build commands. Do not assume scripts exist.
6. Compare actual code, tags, test output and orchestration status. Correct stale status/log entries with evidence; do not silently rewrite history.
7. Report a concise verified baseline and any discrepancies before starting the next module.

Do not recreate the project, overwrite existing work, reset branches, force-push, delete files, or drop databases.

## 2. Product and architecture — non-negotiable

- Product: CampusCore Student Management System (SMS).
- Scope: responsive web application, roadmap **V0 through V49**. V49 is the final stage.
- **MySQL Community Server 8.4 is the only database** in local development, tests, CI, staging and production.
- No SQLite, PostgreSQL, MongoDB, in-memory database substitutes, or other database engines.
- **PWA is explicitly out of scope:** no PWA stage, service worker, offline cache, offline synchronization or push-notification architecture.
- Keep the existing modular architecture and versioned API.
- Build modules using the defined lifecycle: plan → contract → develop → test → security/UX validation → UAT → freeze → integrate → document.
- No fake functionality, dead buttons, fake test success, placeholder API responses or claims unsupported by command output.
- Frozen modules are read-only. Any required change must follow the documented change-request, approval, regression and patch-tag process.
- Never commit credentials, tokens, private keys, production secrets or real student/parent/staff personal data. Use synthetic test data and `.env.example`.

### Technical direction recorded in the TRD / orchestration prompt

The proposed/default stack is:
- Frontend: Next.js, TypeScript, Tailwind CSS.
- Backend: Node.js, Express, TypeScript.
- Database: MySQL 8.4, InnoDB, utf8mb4.
- Data access and migrations: Knex + mysql2; parameterized SQL only.
- Validation: Zod.
- Authentication: Argon2id password hashing; secure HTTP-only cookie sessions stored in MySQL.
- Testing: Vitest and Playwright; accessibility checks with axe-core.
- Quality: ESLint, Prettier, TypeScript checks, GitHub Actions with MySQL service container.

Treat this stack as the documented default, but verify the approved ADR-000 and actual manifests before changing dependencies or architecture.

## 3. Verified remote snapshot at handoff

The following was observed in the GitHub repository while preparing this handoff:

- Repository: `Sandy32513/CampusCore`.
- The default branch content was read from `main`.
- The latest observed commit was:
  - `6aec5e8e16f1c68bb7de0a706454d8df3b975889`
  - Message: `feat(wave-5): implement V7 Departments, V10 Academic Years & Semesters, and V38 Audit Logs`
- Previous observed milestone commits:
  - `feat(v3): complete and freeze V3 User & Role Management (Wave 4)`
  - `feat(v2): complete and freeze V2 Authentication (Wave 3)`
- The latest Wave 5 commit included backend route/service/test files, shared schemas/types, a MySQL migration, module documentation, and orchestration `STATUS.md` / `LOG.md` updates.
- The repository's root `package.json` defines npm workspaces: `shared`, `backend`, `frontend`; root scripts include build, test, lint, typecheck, start:backend and dev:backend.
- The orchestration status board records **7 frozen modules**: V0, V1, V2, V3, V7, V10 and V38.
- The status board records Wave 5 complete and Wave 6 next: **V8 Course Management and V39 System Settings**.
- V4 Student Management is scheduled after V8 so its course relationship can be a real foreign key.

These are remote observations, not proof that the local working tree is synchronized or that tests currently pass. Recheck everything locally before proceeding.

## 4. Immediate next work

**Expected next wave: Wave 6 — V8 Course Management and V39 System Settings.**

Before implementation:
1. Verify the dependency graph and wave plan. Confirm V8 and V39 can safely run together under the approved DAG.
2. Read their dependencies and the relevant master-plan sections.
3. Inspect extension points and shared registries. Shared files are integrator-owned.
4. Create or verify module contracts, database/API/UI specifications, permission matrices, test plans and security threat models.
5. Observe the human approval checkpoint for any decisions that the orchestration prompt explicitly reserves for the human.
6. Only then dispatch work using the documented agent roster, path ownership and branch/worktree rules.

Do not start V4 before V8 is implemented and frozen, unless an approved decision record explicitly changes the dependency.

## 5. Orchestration and Git discipline

Follow `SMS_MULTI_AGENT_ORCHESTRATION_PROMPT.md` exactly unless a higher-priority approved project document says otherwise.

- The orchestrator owns planning, dispatch, verification, integration and freeze decisions; specialists own only assigned paths.
- Default parallelism in the prompt: `MAX_PARALLEL_MODULES=3`, subject to the approved DAG and conflict-free ownership.
- Use separate feature branches/worktrees per agent where available.
- Shared registries, migration index, package manifests/lockfiles and CI configuration are integrator-owned.
- Merge one module at a time through the integration queue.
- After integration, run the full migration chain from an empty MySQL database, test rollback of the latest migration, and run the full quality/regression pipeline.
- Never weaken or skip tests to obtain a green build.
- Record every dispatch, result, decision, blocker, gate and freeze in `docs/orchestration/LOG.md`.
- Keep `docs/orchestration/STATUS.md` accurate, including tags, branches, defects and blockers.
- At the start of each new Codex session, reread STATUS, the tail of LOG and open ADRs, then verify Git state and tests.

## 6. Important discrepancies to verify — do not guess

The remote orchestration status and other documents may contain drift. Resolve these from repository evidence and approved decisions:

1. The master plan's V41–V49 roadmap names security hardening, performance, accessibility, responsive/mobile optimization, API platform, integration layer, production deployment, monitoring and final certification. The status board currently labels some later versions differently (for example V44 Internationalization, V45 Multi-Branch/Campus, V47 Third-Party Integrations and V48 Developer API/Webhooks). **Do not adopt these altered labels or reorder versions silently.** Reconcile the status board, DAG, WAVES and master plan through an explicit human-approved decision/update.
2. The orchestration prompt's Gate 0 says to stop for human approval of the DAG/waves and ADRs. The LOG records Gate 0 artifacts but does not, in the visible entry, establish the human approval itself. Verify whether that approval was actually given and recorded before treating it as approved.
3. GitHub branch discovery at handoff showed `main`; do not assume `develop` or feature branches exist remotely. Check local and remote refs before branching or merging.
4. The status board says V7/V10/V38 are frozen and Wave 5 complete. Verify the corresponding tags, source, tests and CI evidence; a status label alone is not proof.
5. Confirm the repository contains the expected current master plan at `docs/MASTER_PLAN.md` and root filename. The GitHub remote has both the updated master-plan file and a `docs/MASTER_PLAN.md` path observed pointing to the same content; avoid maintaining divergent copies.

## 7. NDA, privacy and AI-tool caution

The supplied Mutual NDA draft says third-party software/AI tools may receive Confidential Information only when listed in Schedule 2 or approved in writing in advance. The Schedule 2 table in the version reviewed contains a placeholder and does not list Codex.

Before submitting confidential project information, source code, internal architecture or other non-public material to Codex, the responsible parties must confirm that Codex is an approved tool under the executed agreement and applicable provider settings/terms. Do not assume approval. The NDA also prohibits entering credentials, keys, secrets and Personal Data into third-party tools.

Use synthetic/anonymized data only. Never paste GitHub PATs, database passwords, signing keys, production environment files, or real student/parent/staff data into prompts.

This handoff intentionally contains no secrets or personal data.

## 8. Codex operating prompt

Use this instruction when starting Codex in the repository:

> You are the engineering continuation agent for CampusCore SMS. Read SESSION.md first, then all authoritative project documents and current orchestration state. Verify the actual Git tree, tags, branches, package scripts and tests before claiming project status. Continue from the existing implementation; do not restart or scaffold over it. The next planned work is Wave 6 (V8 Courses and V39 Settings), but first verify Gate 0 approval, DAG/WAVES, module contracts, dependencies and repository state. Follow MySQL 8.4 only, no PWA, the V0–V49 master plan, strict module freeze rules, path ownership, tests and evidence requirements. Do not make destructive Git/database changes or alter frozen modules without the required approval. Do not expose secrets or real personal data. If the roadmap/status discrepancies in SESSION.md are unresolved, stop and present the evidence and recommended correction before changing scope. Work in small, reviewable steps and update STATUS.md and LOG.md with verified results.

## 9. Handoff completion checklist

- [ ] Codex has read SESSION.md and all five source documents.
- [ ] Local branch and working tree inspected; uncommitted work preserved.
- [ ] Current tags, branches and latest commits verified.
- [ ] MySQL 8.4 connection and database state checked without destructive operations.
- [ ] Existing test/lint/typecheck/build commands executed and outputs recorded.
- [ ] Gate 0 approval and open ADRs confirmed.
- [ ] Status/DAG/WAVES roadmap discrepancies reconciled.
- [ ] NDA approval for Codex checked before sharing confidential material.
- [ ] Wave 6 contracts approved before implementation begins.

**Success condition:** Codex continues the existing CampusCore project from verified repository state, with no lost work, no architectural drift and no unsupported completion claims.


---

## 10. Additional Codex verification notes (2026-11-22)

### Root scripts observed on GitHub

The root `package.json` declares npm workspaces `shared`, `backend`, `frontend` and scripts:
- `npm run build`
- `npm test`
- `npm run lint`
- `npm run typecheck`
- `npm run start:backend`
- `npm run dev:backend`

Verify each workspace script exists before assuming the root command performs work; the root scripts use `--if-present` for workspaces.

### Wave 5 historical evidence in the orchestration log

The remote `docs/orchestration/LOG.md` records Wave 5 (V7, V10, V38) as frozen and claims 41/41 Vitest integration tests passed. The status board records tags:
- `v7.0.0-departments`
- `v10.0.0-academic-years`
- `v38.0.0-audit-logs`

These are reported historical outcomes. Confirm the tags exist and point to the intended commits, inspect their source, and rerun tests. Do not infer successful CI from a log entry.

### V44–V48 scope conflict — master plan governs

The updated master plan roadmap says:
- V44 Responsive / Mobile Optimization
- V45 API Platform
- V46 Integration Layer
- V47 Production Deployment
- V48 Monitoring & Observability
- V49 Final Production Certification

The remote status board uses conflicting names for some of these versions. Treat the master plan as the scope authority. Correct the status board and dependency artifacts through a documented, approved reconciliation before those versions are scheduled or implemented. Do not silently reinterpret the roadmap.

### NDA approval gate

The reviewed NDA is a draft and Schedule 2 contains a placeholder rather than an explicit Codex approval. The project owner/legal parties must confirm approval before confidential material is submitted to Codex. Do not upload the NDA itself or other confidential documents to an AI service unless that use is approved under the executed agreement.

## 11. Audit update (2026-11-23)

Wave 7 (V4, V9, V40) is present at commit `cb1ffbe`, and the pre-Wave-8 audit is in progress on the local `audit/pre-wave8` branch. Do not treat the older “Wave 6 next” statements above as current. Wave 8 has not started and remains blocked pending audit findings and the approval gate. See `docs/audit/pre-wave8/08-APPROVAL-PACKAGE.md` for current status.

### Verification update (2026-11-23)

Audit fixes are committed on `audit/pre-wave8`, including CC-F-305 (`bed27d9`, `v4.0.1-students`) and CC-F-601 (`6db835e`, `v0.0.1-foundation`; typecheck ordering follow-up `974f352`, `v0.0.2-foundation`). Ten DB-independent unit files pass 38/38; typecheck, lint, build, frontend inline-script syntax parsing, and `git diff --check` pass locally. npm audit has 0 advisories. Remote Gitleaks, quality checks, and migration rollback/reapply pass; the first full DB suite found four fixture/scratch-schema failures, corrected locally and awaiting rerun. Dedicated MySQL restore/auth matrices, Playwright/axe, and performance checks remain outstanding. Gate A8 is NOT READY; do not start Wave 8.
