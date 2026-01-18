-- Rollback: add content column back
ALTER TABLE websites ADD COLUMN IF NOT EXISTS content JSONB;

