-- Migration: Add client_id columns and updated_at for mobile sync
-- Run this against your PostgreSQL database

-- Add client_id to items table (for mobile app UUID mapping)
ALTER TABLE items ADD COLUMN IF NOT EXISTS client_id VARCHAR(36) UNIQUE;

-- Add client_id to bundles table
ALTER TABLE bundles ADD COLUMN IF NOT EXISTS client_id VARCHAR(36) UNIQUE;

-- Add client_id to activity_log table
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS client_id VARCHAR(36) UNIQUE;

-- Create indexes for faster sync queries
CREATE INDEX IF NOT EXISTS idx_items_client_id ON items(client_id);
CREATE INDEX IF NOT EXISTS idx_items_updated_at ON items(updated_at);
CREATE INDEX IF NOT EXISTS idx_bundles_client_id ON bundles(client_id);
CREATE INDEX IF NOT EXISTS idx_bundles_updated_at ON bundles(updated_at);
CREATE INDEX IF NOT EXISTS idx_activity_log_client_id ON activity_log(client_id);

-- Verify migration
SELECT 'Migration complete. Columns added:' as status;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'items' AND column_name IN ('client_id', 'updated_at');
