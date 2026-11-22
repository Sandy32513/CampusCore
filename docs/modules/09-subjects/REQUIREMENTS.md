# V9 — Subject Management: Requirements

## Functional Requirements
- **FR-09-01**: Unique subject code constraint (e.g. `CS101-TH`).
- **FR-09-02**: Mandatory foreign key mapping to `departments.id`.
- **FR-09-03**: Distinct tracking of `theory_credits` and `practical_credits`, with `credits` representing total academic weight.
- **FR-09-04**: Ability to map a subject to multiple degree courses across specific semesters via `course_subjects`.
- **FR-09-05**: Access control restricting modifications to `SUPER_ADMIN` and `ADMIN`.
- **FR-09-06**: Transactional audit log recording in V38 for all catalog changes.

## Non-Functional Requirements
- **NFR-09-01**: Course curriculum query latency under 30ms.
- **NFR-09-02**: Cascade deletion on mapping junction table when either course or subject is deleted.
