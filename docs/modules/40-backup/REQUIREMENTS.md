# V40 — Database Backup & Recovery: Requirements

## Functional Requirements
- **FR-40-01**: Generate full SQL dumps of the active MySQL database instance.
- **FR-40-02**: Calculate and record SHA-256 cryptographic checksums immediately upon generation.
- **FR-40-03**: Verify disk existence and compare live SHA-256 with stored checksums on demand.
- **FR-40-04**: Simulate/execute restore with integrity preconditions.
- **FR-40-05**: Restrict trigger and restore operations exclusively to `SUPER_ADMIN`.
- **FR-40-06**: Record all backup operations in V38 `audit_logs`.

## Non-Functional Requirements
- **NFR-40-01**: Backup generation must not block or crash server request processing.
- **NFR-40-02**: Checksum computation must complete in under 5 seconds for dumps up to 500MB.
