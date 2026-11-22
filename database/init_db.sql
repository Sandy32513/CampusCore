CREATE DATABASE IF NOT EXISTS sms_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS sms_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'sms_migrator'@'localhost' IDENTIFIED BY 'Migrator@123';
ALTER USER 'sms_migrator'@'localhost' IDENTIFIED BY 'Migrator@123';
GRANT ALL PRIVILEGES ON sms_dev.* TO 'sms_migrator'@'localhost';
GRANT ALL PRIVILEGES ON sms_test.* TO 'sms_migrator'@'localhost';

CREATE USER IF NOT EXISTS 'sms_migrator'@'127.0.0.1' IDENTIFIED BY 'Migrator@123';
ALTER USER 'sms_migrator'@'127.0.0.1' IDENTIFIED BY 'Migrator@123';
GRANT ALL PRIVILEGES ON sms_dev.* TO 'sms_migrator'@'127.0.0.1';
GRANT ALL PRIVILEGES ON sms_test.* TO 'sms_migrator'@'127.0.0.1';

CREATE USER IF NOT EXISTS 'sms_app'@'localhost' IDENTIFIED BY 'AppPassword@123';
ALTER USER 'sms_app'@'localhost' IDENTIFIED BY 'AppPassword@123';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON sms_dev.* TO 'sms_app'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON sms_test.* TO 'sms_app'@'localhost';

CREATE USER IF NOT EXISTS 'sms_app'@'127.0.0.1' IDENTIFIED BY 'AppPassword@123';
ALTER USER 'sms_app'@'127.0.0.1' IDENTIFIED BY 'AppPassword@123';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON sms_dev.* TO 'sms_app'@'127.0.0.1';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON sms_test.* TO 'sms_app'@'127.0.0.1';

FLUSH PRIVILEGES;
