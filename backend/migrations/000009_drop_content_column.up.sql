-- Drop content column if it exists (for existing databases)
ALTER TABLE websites DROP COLUMN IF EXISTS content;

-- Ensure URL column exists
DO $$ 
BEGIN 
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_name='websites' AND column_name='url'
	) THEN
		ALTER TABLE websites ADD COLUMN url VARCHAR(500);
	END IF;
END $$;

