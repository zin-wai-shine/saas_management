ALTER TABLE users ADD COLUMN business_name VARCHAR(255);
CREATE INDEX idx_users_business_name ON users(business_name);
CREATE INDEX idx_users_name ON users(name);

