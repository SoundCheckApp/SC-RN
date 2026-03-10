-- ============================================
-- Fix Musicians Table Schema
-- Run this to update the musicians table with correct columns
-- ============================================

-- Add missing columns if they don't exist
ALTER TABLE musicians 
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Rename genre to genres (if genre exists)
DO $$ 
BEGIN
  -- Check if genre column exists and rename it to genres
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'musicians' AND column_name = 'genre'
  ) THEN
    ALTER TABLE musicians RENAME COLUMN genre TO genres;
  END IF;
  
  -- If genres column doesn't exist at all, create it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'musicians' AND column_name = 'genres'
  ) THEN
    ALTER TABLE musicians ADD COLUMN genres TEXT;
  END IF;
END $$;

-- ============================================
-- Verify the changes
-- ============================================
-- After running, check the table structure:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'musicians' 
-- ORDER BY ordinal_position;
