# V0 Foundation: Module Contract

- **Module:** V0 Project Foundation
- **Status:** CONTRACT-FROZEN (Gate A Approved)
- **Date:** 2026-11-22
- **Lead Architect:** Antigravity Orchestrator

## 1. Scope
Deliver the technical foundation for the Student Management System (SMS):
- Monorepo workspace configuration (`shared`, `backend`, `frontend`)
- TypeScript configurations and lint/formatting standards
- MySQL 8.4 connection configuration via `mysql2` and `knex`
- Standard API response/error envelope
- Backend Express server with `/health` and `/api/v1/health` endpoints
- Responsive frontend foundation displaying system and service health status
- Central extension point manifest interfaces in `shared`
- Complete automated test suite for health check and database connectivity

## 2. API Specification
### `GET /health` and `GET /api/v1/health`
- **Method:** `GET`
- **Auth:** None (Public readiness/liveness probe)
- **Response Format (Plan §64, TRD §6):**
  - **Success (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "status": "healthy",
        "database": "connected",
        "version": "0.0.0",
        "uptime": 12.34,
        "timestamp": "2026-11-22T07:30:00.000Z"
      },
      "message": "CampusCore SMS Foundation API is healthy"
    }
    ```
  - **Degraded / DB Unavailable (503 Service Unavailable):**
    ```json
    {
      "success": false,
      "error": {
        "code": "DATABASE_UNAVAILABLE",
        "message": "Database connection failed",
        "details": [],
        "requestId": "req-xxx"
      }
    }
    ```

## 3. Database Specification
- **Engine:** MySQL 8.4 LTS
- **Charset:** `utf8mb4_0900_ai_ci`
- **Tables in V0:** None required yet. V0 validates driver connectivity (`SELECT 1+1 AS result`) and migrations table setup (`knex_migrations`).

## 4. UI Specification
- **Route:** `/`
- **Screens:** Single dashboard landing card displaying:
  - System title: CampusCore Student Management System
  - Badge: Foundation V0
  - Live status indicators:
    - Frontend: Healthy (Green)
    - Backend API: Connected / Disconnected (with latency)
    - MySQL Database: Connected / Disconnected
  - System metadata (Version, Node.js version, Timestamp)
- **UI States Handled:** Loading, Success, Backend Error, Database Error.

## 5. Permission Matrix
- Public endpoints: `/health`, `/api/v1/health`, `/`
- No authenticated roles required for V0.

## 6. Integration Contract & Extension Points
- `shared/src/types/manifest.ts`: Defines `ModuleManifest` interface for subsequent modules.
- `shared/src/types/response.ts`: Defines `ApiResponse<T>` and `ApiErrorResponse`.
