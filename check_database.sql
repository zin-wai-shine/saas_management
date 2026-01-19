-- Check if URL column exists in websites table
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'websites' 
ORDER BY ordinal_position;

-- Check recent websites (if any)
SELECT id, title, url, theme_name, status, created_at 
FROM websites 
ORDER BY created_at DESC 
LIMIT 5;

