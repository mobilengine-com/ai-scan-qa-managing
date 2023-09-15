PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "ai_scan_settings" ("name" text, "value" text);
INSERT INTO ai_scan_settings VALUES('delay_time_hour','1');
COMMIT;