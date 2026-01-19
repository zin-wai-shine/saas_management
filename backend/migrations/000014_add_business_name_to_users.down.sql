DROP INDEX IF EXISTS idx_users_name;
DROP INDEX IF EXISTS idx_users_business_name;
ALTER TABLE users DROP COLUMN IF EXISTS business_name;

