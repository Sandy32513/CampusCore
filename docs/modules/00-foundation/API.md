# V0 Foundation: API Specification

## Endpoints

### 1. `GET /health` and `GET /api/v1/health`
Checks backend process uptime and MySQL connection state.

- **URL:** `/health`, `/api/v1/health`
- **Method:** `GET`
- **Auth Required:** No
- **Headers:** None required. Optional `X-Request-Id`.
- **Response Format:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "version": "0.0.0",
    "uptime": 45.12,
    "timestamp": "2026-11-22T07:35:00.000Z"
  },
  "message": "CampusCore SMS backend is healthy"
}
```
- **Status Codes:**
  - `200 OK`: Server running (database connected or standby)
  - `500 Internal Server Error`: Unhandled process error
