# Wave 8 Readiness

**Recommendation: NOT READY. Do not start V5, V6, or V12.** The pre-Wave-8 remediation is committed on `audit/pre-wave8`; two full MySQL 8.4 CI suites, a seeded shuffled suite, and isolated backup restore now pass. Broader failure injection, authorization, browser, performance, and operational evidence remains incomplete. CC-F-202, CC-F-203, and CC-F-601 are fixed and validated; other findings remain partial, blocked, or open.

## Blocking findings

- **CC-F-201:** Service memory fallbacks have been removed and ten service families have DB-error regression coverage. The full MySQL suite passes in CI; broader service/route failure-path and mutation checks remain outstanding.
- **CC-F-301:** Argon2id and legacy scrypt rehash-on-login are implemented with unit coverage. ADR-000 approval evidence and DB login integration remain open.
- **CC-F-302:** Browser auth uses the HttpOnly cookie and dynamic API markup is escaped. Browser, keyboard, viewport, and axe checks remain blocked.
- **CC-F-303:** Process-local login throttling and Origin/Fetch-Metadata/custom-header CSRF checks are implemented. Multi-instance behavior and browser integration remain unverified.
- **CC-F-305:** Student reads now scope student accounts to their linked `user_id`; parent reads are denied until V6 has a consent-backed relationship. Route/query unit checks pass; DB authorization matrix remains blocked.
- **CC-F-205:** Async auth/session errors and Express 4 promise rejections reach centralized handling in unit checks; DB-backed failure validation remains blocked.
- **CC-F-401:** Hot-path indexes, target-scale data, and `EXPLAIN ANALYZE` were not verified.
- **CC-F-901:** Student Profile tab-registry prerequisite remains unresolved.
- **CC-F-902:** Guardian/student link and consent model prerequisite remains unresolved.
- **CC-F-903:** Teacher identity link and specialization model prerequisite remains unresolved.

## Additional release gates

CC-F-201 and CC-F-204 remain partially remediated pending full failure-path validation. CC-F-301 needs DB login/re-hash integration and ADR-000 approval. CC-F-304 needs live deployment-config validation. CC-F-501 needs browser and accessibility review. CC-F-202 backup/restore, CC-F-203 test integrity, and CC-F-601 CI/secret scanning now pass their defined checks; broader authorization/failure matrices, mutation checks, and governance/roadmap decisions CC-F-801/802 remain open.

Audit remediation commits and patch tags through `v0.0.5-foundation` (including `v4.0.1-students`) are on `audit/pre-wave8`. No Wave 8 implementation, branch, or migration has been started.
