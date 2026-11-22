# V40 — Database Backup & Recovery: Database Schema

## Table: `database_backups`
```sql
CREATE TABLE `database_backups` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `filename` VARCHAR(255) NOT NULL UNIQUE,
  `filepath` VARCHAR(500) NOT NULL,
  `file_size_bytes` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `backup_type` VARCHAR(30) NOT NULL DEFAULT 'FULL',
  `status` VARCHAR(30) NOT NULL DEFAULT 'COMPLETED',
  `checksum_sha256` VARCHAR(64) NULL,
  `created_by_user_id` BIGINT UNSIGNED NULL,
  `retention_days` INT UNSIGNED NOT NULL DEFAULT 30,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `completed_at` TIMESTAMP NULL,
  CONSTRAINT `database_backups_user_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

CREATE INDEX `idx_backups_status` ON `database_backups` (`status`);
```
