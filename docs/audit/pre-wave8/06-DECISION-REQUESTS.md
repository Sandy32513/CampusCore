# Decision Requests

## DR-01 — Confirm project-tool NDA authorization and restore safe audit execution

The NDA in the repository is a draft and Schedule 2 contains only placeholders. It does not list Codex. No sub-agents were used. Confirm the executed NDA/tool approval through the project’s authorized process before any external sharing. Git is now available through MinGit and `audit/pre-wave8` exists. Provision authorized MySQL 8.4 audit scratch credentials so DB-dependent audit/remediation can resume.

## DR-02 — Record Argon2id migration decision

TRD and ADR-000 specify Argon2id; source now uses Node 26 Argon2id while retaining legacy scrypt verification and rehash-on-successful-login. Unit tests pass for both paths, but DB login/re-hash integration and an ADR approval record remain open. Recommendation: record the human ADR decision and validate the migration path against an audit schema before release.

## DR-03 — Validate the real backup and restore path

V40 source now streams base-table DDL and data into SQL and restores only into a distinct pre-provisioned `sms_audit_*` schema, then verifies table lists, row counts, and checksums. Unit serialization tests pass. No MySQL dump/restore was run because authorized scratch credentials/schema are unavailable. Recommendation: validate source and restore on MySQL 8.4 and document operational permissions before release; the implementation must continue reporting failure when target setup or integrity checks fail.

## DR-04 — Resolve roadmap labels and Gate 0 records

Master Plan is scope authority. STATUS/WAVES names for V44–V48 conflict with it; ADR-000–002 remain Proposed and inspected docs do not record Gate 0 human approval. Recommendation: reconcile labels with dated evidence and record human decisions without silently changing roadmap scope.

## DR-05 — Confirm frontend stack direction

Current frontend is a static HTML document served by a small TypeScript workspace; TRD/ADR-000 propose Next.js, React, and Tailwind. Per prompt, this audit recommends a documented decision rather than a rewrite.

## DR-06 — Release gate remediation queue

Lint was initially a no-op; ESLint now runs in each workspace and passes with zero warnings. Upgrading Vitest to 5.1.1 and Zod to 4.6.7 cleared the 7 npm advisories; `npm audit --json` now reports zero. Gitleaks passed in all three remote runs. Run 3 passed quality, migration rollback/reapply, and scratch provisioning with 114/115 tests passing; backup restore remains 422. Student scope, baseline backup, and scratch setup issues are resolved. Recommendation: fix restore verification and complete a green rerun before release. Recommendation: verify a complete green remote run, including MySQL migrations and the full suite, before release.
