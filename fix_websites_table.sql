-- Fix websites table: Add URL column and Remove Content column
-- Run this script directly on your database if migrations haven't applied correctly

-- Step 1: Add URL column if it doesn't exist
DO $$ 
BEGIN 
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_name='websites' AND column_name='url'
	) THEN
		ALTER TABLE websites ADD COLUMN url VARCHAR(500);
		RAISE NOTICE 'URL column added successfully';
	ELSE
		RAISE NOTICE 'URL column already exists';
	END IF;
END $$;

-- Step 2: Remove content column if it exists
DO $$ 
BEGIN 
	IF EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_name='websites' AND column_name='content'
	) THEN
		ALTER TABLE websites DROP COLUMN content;
		RAISE NOTICE 'Content column removed successfully';
	ELSE
		RAISE NOTICE 'Content column does not exist (already removed)';
	END IF;
END $$;

-- Step 3: Verify the structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'websites'
ORDER BY ordinal_position;

