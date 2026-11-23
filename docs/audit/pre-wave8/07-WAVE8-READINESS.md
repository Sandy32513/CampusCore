# Wave 8 Readiness

**Recommendation: NOT READY. Do not start V5, V6, or V12.** The pre-Wave-8 remediation is committed and pushed on `audit/pre-wave8`; two full MySQL 8.4 CI suites, a seeded shuffled suite, isolated backup restore, the route-by-role matrix, 16 authorization-guard mutation checks, student self-scope route checks against MySQL, a real-driver closed-port HTTP failure probe, the V1 Playwright/axe suite, and a MySQL-backed browser authentication flow pass. Stopping and recovering a running MySQL service, parent relationship authorization, multi-instance throttling/CSRF deployment validation, performance, and operational evidence remain incomplete. CC-F-202, CC-F-203, CC-F-302, CC-F-501, CC-F-502, and CC-F-601 are fixed and validated; other findings remain partial, blocked, or open.

## Blocking findings

- **CC-F-201:** Service memory fallbacks have been removed and ten service families have DB-error regression coverage. The full MySQL suite, route authorization matrix, and closed-port API failure contract pass in CI; stopping and recovering a running database and wider failure-path checks remain outstanding.
- **CC-F-301:** Argon2id and legacy scrypt rehash-on-login are implemented; CI run `45182201358` passed the MySQL-backed login/hash-upgrade/session check. ADR-000 approval remains open.
- **CC-F-303:** Process-local login throttling and Origin/Fetch-Metadata/custom-header CSRF checks are implemented. Multi-instance behavior and browser integration remain unverified.
- **CC-F-305:** Student reads now scope student accounts to their linked `user_id`; run `45180675706` verified list, count, search, own-detail, and cross-student detail behavior against MySQL. Parent reads are denied until V6 has a consent-backed relationship; parent relationship authorization remains incomplete.
- **CC-F-205:** Async auth/session errors and Express 4 promise rejections reach centralized handling in unit checks; DB-backed failure validation remains blocked.
- **CC-F-401:** Hot-path indexes, target-scale data, and `EXPLAIN ANALYZE` were not verified.
- **CC-F-901:** Student Profile tab-registry prerequisite remains unresolved.
- **CC-F-902:** Guardian/student link and consent model prerequisite remains unresolved.
- **CC-F-903:** Teacher identity link and specialization model prerequisite remains unresolved.

## Additional release gates

CC-F-201, CC-F-204, and CC-F-205 pass a real-driver closed-port HTTP contract check but remain partial pending live MySQL outage/recovery validation. CC-F-301 needs ADR-000 approval; DB login/rehash integration passes in CI. CC-F-303 still needs multi-instance throttling and CSRF deployment validation. CC-F-304 needs live deployment-config validation. CC-F-305 has DB-backed student self-scope evidence, but parent relationship authorization remains incomplete until the V6 consent-backed model exists. CC-F-302 live browser/session validation, CC-F-501 shell browser/a11y checks, and CC-F-502 dashboard-status reconciliation pass their defined checks. CC-F-202 backup/restore, CC-F-203 test integrity, and CC-F-601 CI/secret scanning pass their defined checks; performance and governance/roadmap decisions CC-F-801/802 remain open.

Audit remediation commits and patch tags through `v1.0.3-shell` and `v2.0.1-auth` (including `v4.0.1-students`) are on `audit/pre-wave8`. No Wave 8 implementation, branch, or migration has been started.
