-- Reorder URL column to appear after title column
-- PostgreSQL doesn't support ALTER TABLE ... AFTER, so we need to recreate the table

BEGIN;

-- Create new table with correct column order (url after title)
CREATE TABLE websites_new (
	id SERIAL PRIMARY KEY,
	business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
	title VARCHAR(255) NOT NULL,
	url VARCHAR(500),
	theme_name VARCHAR(255) DEFAULT 'default',
	is_demo BOOLEAN DEFAULT true,
	is_claimed BOOLEAN DEFAULT false,
	status VARCHAR(50) DEFAULT 'pending',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from old table to new table
INSERT INTO websites_new (id, business_id, title, url, theme_name, is_demo, is_claimed, status, created_at, updated_at)
SELECT id, business_id, title, url, theme_name, is_demo, is_claimed, status, created_at, updated_at
FROM websites;

-- Drop old table
DROP TABLE websites CASCADE;

-- Rename new table to original name
ALTER TABLE websites_new RENAME TO websites;

-- Recreate sequences and constraints if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'websites_id_seq') THEN
        ALTER SEQUENCE websites_id_seq OWNED BY websites.id;
    ELSE
        CREATE SEQUENCE websites_id_seq OWNED BY websites.id;
        ALTER TABLE websites ALTER COLUMN id SET DEFAULT nextval('websites_id_seq');
    END IF;
END $$;

COMMIT;

