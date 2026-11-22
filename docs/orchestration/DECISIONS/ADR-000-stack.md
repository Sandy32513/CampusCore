# ADR-000: Technology Stack Selection

- **Status:** Proposed (Gate 0)
- **Date:** 2026-11-22
- **Author:** Orchestrator Lead Agent
- **Target:** CampusCore (SMS-2026-001)

## Context
The Student Management System (SMS) Master Plan (§6) and Technical Requirements Document (TRD §4) define strict constraints:
1. **MySQL only:** MySQL Community Edition 8.4 LTS in all environments (local dev, test, CI, production). No SQLite, no PostgreSQL, no in-memory replacements.
2. **Web application only:** Responsive web application (375px to 1920px); PWA features (service workers, offline caching, push notifications) are explicitly out of scope.
3. **Free and Open-Source first:** Maximizing open-source tools, avoiding paid licenses or closed enterprise frameworks.
4. **End-to-End TypeScript:** Type safety across database schemas, API contracts, and user interface.

## Decision
We adopt the following unified stack:

| Layer | Selection | Justification |
|---|---|---|
| **Language & Runtime** | Node.js (Active/Current LTS, v26.x) + TypeScript (strict mode enabled) | Consistent language across full stack, unified typing with `shared/` workspace. |
| **Frontend Framework** | Next.js (App Router) + React + Tailwind CSS | Fast SSR/client transitions, responsive mobile-first utilities, accessible component styling. |
| **UI Components & Icons** | Headless UI primitives + Lucide Icons | WCAG 2.2 AA compliant headless controls, consistent design system components. |
| **Backend Framework** | Node.js + Express.js + TypeScript | Lightweight, unopinionated, high throughput, transparent request lifecycle control. |
| **Database & Driver** | MySQL Community Edition 8.4 LTS via `mysql2` driver | Strict SQL mode, `utf8mb4_0900_ai_ci`, InnoDB transactions, native `caching_sha2_password` support. |
| **Data Access & Migrations**| Knex.js query builder + migration runner (No heavy ORM) | Full explicit control over SQL, zero abstraction overhead, row-locking (`FOR UPDATE`), generated columns. |
| **Validation & Schema** | Zod (centralized in `shared/` workspace) | Single source of truth for API validation, frontend form validation, and OpenAPI 3.1 generation. |
| **Authentication & Session**| Argon2id password hashing + MySQL server-side session store (`sessions` table) | Cryptographically secure against GPU attacks; revocable sessions via httpOnly SameSite=Lax cookies. |
| **Testing Pyramid** | Vitest (unit/integration/component) + Supertest + Playwright (E2E) + axe-core | Rapid parallel execution, real MySQL test containers, multi-browser accessibility verification. |
| **Code Quality & CI** | ESLint + Prettier + `tsc --noEmit` + Gitleaks + GitHub Actions | Zero-tolerance lint and typecheck policy, secret leakage prevention, automated MySQL 8.4 service container. |

## Consequences
- **Positive:** No runtime impedance mismatch between frontend and backend; shared Zod schemas prevent API drift; explicit Knex SQL queries prevent N+1 query surprises; strict MySQL 8.4 parity across CI and production avoids environment incompatibilities.
- **Negative:** Requires writing explicit migrations and query builder repositories rather than automated ORM reflection. This is an intentional trade-off to ensure database performance, explicit locking, and transaction predictability.
