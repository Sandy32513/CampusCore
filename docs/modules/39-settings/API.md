# V39 System Settings: API Reference

## Base Path: `/api/v1/settings`

### Endpoints

#### 1. Get Public Settings
- **Method:** `GET`
- **Path:** `/api/v1/settings/public`
- **Auth:** Open / Unauthenticated
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "settings": {
      "institutionName": "CampusCore University",
      "institutionCode": "CCU",
      "contactEmail": "admin@campuscore.edu",
      "contactPhone": "+1-800-555-0199",
      "address": "100 Innovation Way, Tech Campus",
      "timezone": "UTC",
      "dateFormat": "YYYY-MM-DD",
      "timeFormat": "24H",
      "currency": "USD",
      "currencySymbol": "$",
      "attendanceThresholdPct": 75
    }
  },
  "message": "Public settings retrieved successfully"
}
```

#### 2. Get All System Settings
- **Method:** `GET`
- **Path:** `/api/v1/settings`
- **Auth:** Required (`requireAuth`)
- **Response (200 OK):** Full dictionary of all system configuration keys including private parameters.

#### 3. Update System Settings
- **Method:** `PUT`
- **Path:** `/api/v1/settings`
- **Auth:** Required (`SUPER_ADMIN` only)
- **Body:**
```json
{
  "institution_name": "CampusCore Institute of Technology",
  "attendance_threshold_pct": "80"
}
```
- **Response (200 OK):** Updated settings dictionary.
- **Errors:** `400 Bad Request` (invalid format), `403 Forbidden` (non-super-admin).
