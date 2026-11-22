# V9 — Subject Management: Database Schema

## Tables

### 1. `subjects`
```sql
CREATE TABLE `subjects` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `department_id` INT UNSIGNED NOT NULL,
  `type` VARCHAR(30) NOT NULL DEFAULT 'THEORY',
  `credits` INT UNSIGNED NOT NULL DEFAULT 3,
  `theory_credits` INT UNSIGNED NOT NULL DEFAULT 3,
  `practical_credits` INT UNSIGNED NOT NULL DEFAULT 0,
  `is_elective` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `subjects_department_id_fk` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT
);

CREATE INDEX `idx_subjects_department_id` ON `subjects` (`department_id`);
CREATE INDEX `idx_subjects_type` ON `subjects` (`type`);
CREATE INDEX `idx_subjects_is_active` ON `subjects` (`is_active`);
```

### 2. `course_subjects`
```sql
CREATE TABLE `course_subjects` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT UNSIGNED NOT NULL,
  `subject_id` INT UNSIGNED NOT NULL,
  `semester_number` INT UNSIGNED NOT NULL DEFAULT 1,
  `is_mandatory` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `course_subjects_course_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_subjects_subject_id_fk` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `idx_course_subject_semester` (`course_id`, `subject_id`, `semester_number`)
);
```
