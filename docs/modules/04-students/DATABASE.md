# V4 — Student Management: Database Schema

## Table: `students`
Dedicated table in MySQL 8.4 LTS InnoDB storage engine.

```sql
CREATE TABLE `students` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NULL,
  `admission_number` VARCHAR(50) NOT NULL UNIQUE,
  `roll_number` VARCHAR(50) NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(30) NULL,
  `date_of_birth` DATE NOT NULL,
  `gender` VARCHAR(20) NOT NULL DEFAULT 'OTHER',
  `blood_group` VARCHAR(10) NULL,
  `department_id` INT UNSIGNED NOT NULL,
  `course_id` INT UNSIGNED NOT NULL,
  `current_semester_id` INT UNSIGNED NOT NULL,
  `admission_date` DATE NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  `emergency_contact_name` VARCHAR(100) NULL,
  `emergency_contact_phone` VARCHAR(30) NULL,
  `address_line1` VARCHAR(255) NULL,
  `city` VARCHAR(100) NULL,
  `state` VARCHAR(100) NULL,
  `postal_code` VARCHAR(20) NULL,
  `country` VARCHAR(100) NOT NULL DEFAULT 'USA',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `students_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `students_department_id_fk` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `students_course_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `students_semester_id_fk` FOREIGN KEY (`current_semester_id`) REFERENCES `semesters` (`id`) ON DELETE RESTRICT
);

CREATE INDEX `idx_students_department_id` ON `students` (`department_id`);
CREATE INDEX `idx_students_course_id` ON `students` (`course_id`);
CREATE INDEX `idx_students_semester_id` ON `students` (`current_semester_id`);
CREATE INDEX `idx_students_status` ON `students` (`status`);
```
