# Wave 8 Readiness

**Recommendation: NOT READY. Do not start V5, V6, or V12.** The pre-Wave-8 source remediation is uncommitted and has only DB-independent validation. No finding is marked fixed and validated.

## Blocking findings

- **CC-F-201:** Service memory fallbacks have been removed and ten service families have DB-error regression coverage. The full database-backed suite and route integration checks remain blocked.
- **CC-F-202:** Backup source now streams DDL and data and validates an isolated restore target with table, row-count, and checksum manifests. No real MySQL source dump or restore has run.
- **CC-F-301:** Argon2id and legacy scrypt rehash-on-login are implemented with unit coverage. ADR-000 approval evidence and DB login integration remain open.
- **CC-F-302:** Browser auth uses the HttpOnly cookie and dynamic API markup is escaped. Browser, keyboard, viewport, and axe checks remain blocked.
- **CC-F-303:** Process-local login throttling and Origin/Fetch-Metadata/custom-header CSRF checks are implemented. Multi-instance behavior and browser integration remain unverified.
- **CC-F-205:** Async auth/session errors and Express 4 promise rejections reach centralized handling in unit checks; DB-backed failure validation remains blocked.
- **CC-F-401:** Hot-path indexes, target-scale data, and `EXPLAIN ANALYZE` were not verified.
- **CC-F-901:** Student Profile tab-registry prerequisite remains unresolved.
- **CC-F-902:** Guardian/student link and consent model prerequisite remains unresolved.
- **CC-F-903:** Teacher identity link and specialization model prerequisite remains unresolved.

## Additional release gates

CC-F-203 and CC-F-204 remain partially remediated pending a full DB suite. CC-F-304 needs live deployment-config validation. CC-F-501 needs browser and accessibility review. CC-F-601 needs CI, gitleaks, and dependency-advisory triage. Governance and roadmap requests CC-F-801/802 remain open as recorded in the findings register and decision requests.

The local audit branch contains no commits or tags. No Wave 8 implementation, branch, or migration has been started.
