# V1 Application Shell: API Specification

## 1. Endpoints

### `GET /api/v1/modules`
Returns the active module catalog and status across the platform roadmap.

- **Method:** `GET`
- **Auth:** Public
- **Response Format:**
```json
{
  "success": true,
  "data": {
    "modules": [
      {
        "id": "v0-foundation",
        "name": "Project Foundation",
        "slug": "foundation",
        "version": "V0",
        "wave": 1,
        "category": "system",
        "description": "Core technical foundation, toolchains, base configs, and health check API.",
        "icon": "🏗️",
        "status": "FROZEN",
        "path": "/foundation"
      },
      {
        "id": "v1-shell",
        "name": "Application Shell",
        "slug": "shell",
        "version": "V1",
        "wave": 2,
        "category": "system",
        "description": "Complete UI layout shell, navigation, design system, and module registry.",
        "icon": "🖥️",
        "status": "FROZEN",
        "path": "/"
      }
    ]
  },
  "message": "CampusCore module registry retrieved successfully"
}
```

### `GET /api/v1/modules/:slug`
Retrieves detailed descriptor for a single module.
- **Status Codes:**
  - `200 OK`: Module found
  - `404 Not Found`: Module slug does not exist in registry
