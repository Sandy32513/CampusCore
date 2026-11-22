# V40 — Database Backup & Recovery: Security & Access Control

## Access Matrix

| Action | SUPER_ADMIN | ADMIN | TEACHER | STAFF | STUDENT | PARENT |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `GET /backups` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `GET /backups/:id/verify` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `POST /backups` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `POST /backups/:id/restore` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `DELETE /backups/:id` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Security Controls
- **Privilege Separation:** Backup triggering, restore, and file deletion are strictly restricted to the `SUPER_ADMIN` lead.
- **Tamper Evidence:** Backups cannot be verified or restored if their SHA-256 hash does not match the metadata record.
- **Directory Traversal Protection:** Filepaths are normalized to `./storage/backups/`.
