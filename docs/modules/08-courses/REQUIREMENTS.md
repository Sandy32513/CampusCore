# V8 Course Management: Requirements Document

## 1. Functional Requirements
- **FR-08-1:** Unique course code normalized to uppercase (e.g. `BTECH-CSE`, `MBA-FIN`).
- **FR-08-2:** Department referential integrity: Every course must belong to a valid active department. Deleting or deactivating a department with active courses is prohibited.
- **FR-08-3:** Academic metrics: Record standard program duration in years and required credits for degree completion.
- **FR-08-4:** Course status lifecycle: Active/inactive status toggling with relational dependency warnings.
- **FR-08-5:** Role-based authorization: Creation and updates restricted to `SUPER_ADMIN` and `ADMIN`. Read operations available to all authenticated users.
- **FR-08-6:** Audit log integration: All lifecycle events logged to V38 Audit Logs.
