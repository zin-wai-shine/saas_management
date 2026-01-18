-- Rollback: Reorder URL column back to end (if needed)
-- This is mostly for migration consistency, typically not needed

BEGIN;

CREATE TABLE websites_rollback (
	id SERIAL PRIMARY KEY,
	business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
	title VARCHAR(255) NOT NULL,
	theme_name VARCHAR(255) DEFAULT 'default',
	is_demo BOOLEAN DEFAULT true,
	is_claimed BOOLEAN DEFAULT false,
	status VARCHAR(50) DEFAULT 'pending',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	url VARCHAR(500)
);

INSERT INTO websites_rollback (id, business_id, title, url, theme_name, is_demo, is_claimed, status, created_at, updated_at)
SELECT id, business_id, title, url, theme_name, is_demo, is_claimed, status, created_at, updated_at
FROM websites;

DROP TABLE websites CASCADE;
ALTER TABLE websites_rollback RENAME TO websites;
ALTER SEQUENCE websites_id_seq OWNED BY websites.id;

COMMIT;

