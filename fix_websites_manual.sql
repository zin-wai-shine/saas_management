-- Manual Fix Script for Websites Table
-- Run this directly in your PostgreSQL database if migrations haven't run

-- Connect to your database first:
-- psql -U zinwaishine -d saas_management

-- Add URL column if it doesn't exist
DO $$ 
BEGIN 
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_name='websites' AND column_name='url'
	) THEN
		ALTER TABLE websites ADD COLUMN url VARCHAR(500);
		RAISE NOTICE '✓ URL column added successfully';
	ELSE
		RAISE NOTICE '✓ URL column already exists';
	END IF;
END $$;

-- Remove content column if it exists
DO $$ 
BEGIN 
	IF EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_name='websites' AND column_name='content'
	) THEN
		ALTER TABLE websites DROP COLUMN content;
		RAISE NOTICE '✓ Content column removed successfully';
	ELSE
		RAISE NOTICE '✓ Content column does not exist';
	END IF;
END $$;

-- Verify the structure
SELECT 
	column_name, 
	data_type, 
	is_nullable
FROM information_schema.columns
WHERE table_name = 'websites'
ORDER BY ordinal_position;

