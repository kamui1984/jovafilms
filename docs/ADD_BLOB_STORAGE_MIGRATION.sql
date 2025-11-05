-- Migration: Add blob_storage_path column to reviews table
-- Date: November 2024
-- Purpose: Track Azure Blob Storage file paths for review text files

-- Add the new column
ALTER TABLE reviews 
ADD COLUMN blob_storage_path VARCHAR(500);

-- Add comment to column
COMMENT ON COLUMN reviews.blob_storage_path IS 'Azure Blob Storage URL for review text file';

-- Verify the migration
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'reviews' AND column_name = 'blob_storage_path';
