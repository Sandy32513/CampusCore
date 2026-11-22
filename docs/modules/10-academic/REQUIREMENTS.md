# V10 Academic Year & Semester: Requirements Document

## 1. Functional Requirements
- **FR-10-1:** Academic Year definition with unique label (e.g. "2026-2027") and strict chronological dates (`start_date < end_date`).
- **FR-10-2:** Single current academic year invariant: Setting an academic year as current automatically clears previous current designation.
- **FR-10-3:** Semesters bounded within academic year timeline: Semester `start_date` and `end_date` must fall within the enclosing academic year dates.
- **FR-10-4:** Term numbering uniqueness: No duplicate `term_number` within the same academic year.
- **FR-10-5:** Single active operational semester invariant: Only one semester can be marked `is_active = true` at any given time.
- **FR-10-6:** Historical semester protection: Concluded/closed semesters are marked `is_closed = true` and locked from grade and attendance alterations.
- **FR-10-7:** Audit logging integration: All creations, updates, activations, and transitions logged to V38 Audit Logs.
