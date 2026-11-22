# V10 Academic Year & Semester: Security & Threat Model

## 1. Threat Modeling (STRIDE)
- **Unauthorized Calendar Mutation:** Restricted to `SUPER_ADMIN` and `ADMIN` roles. Non-admin users have read-only access.
- **Temporal Inconsistency Attack:** Prevent semester dates spanning outside academic year boundaries or end dates prior to start dates via schema validation.
- **State Confusion:** Prevent race conditions when activating terms using atomic database transactions.
- **Tampering of Historical Records:** Semesters marked `is_closed = true` reject downstream grade or attendance adjustments.
