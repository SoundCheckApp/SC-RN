-- ============================================
-- Fix Schema to Use id Instead of profile_id
-- Run this to update existing tables to match the correct schema
-- ============================================

-- ============================================
-- Fix musicians table
-- ============================================

-- Drop profile_id column if it exists (after migrating data if needed)
DO $$ 
BEGIN
  -- Check if profile_id exists and id doesn't reference profiles
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'musicians' AND column_name = 'profile_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'musicians' 
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'id'
  ) THEN
    -- If there's data, you might want to migrate it first
    -- For now, we'll drop the profile_id column
    ALTER TABLE musicians DROP COLUMN IF EXISTS profile_id;
  END IF;
  
  -- Ensure id references profiles.id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'musicians' 
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'id'
  ) THEN
    -- Add foreign key constraint if profiles table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
      ALTER TABLE musicians 
        ADD CONSTRAINT musicians_id_fkey 
        FOREIGN KEY (id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- ============================================
-- Fix consumers table
-- ============================================

-- Drop profile_id column if it exists
DO $$ 
BEGIN
  -- Check if profile_id exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'consumers' AND column_name = 'profile_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'consumers' 
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'id'
  ) THEN
    ALTER TABLE consumers DROP COLUMN IF EXISTS profile_id;
  END IF;
  
  -- Ensure id references profiles.id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'consumers' 
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'id'
  ) THEN
    -- Add foreign key constraint if profiles table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
      ALTER TABLE consumers 
        ADD CONSTRAINT consumers_id_fkey 
        FOREIGN KEY (id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- ============================================
-- Update RLS Policies for musicians
-- ============================================
DROP POLICY IF EXISTS "Users can view their own musician record" ON musicians;
DROP POLICY IF EXISTS "Users can insert their own musician record" ON musicians;
DROP POLICY IF EXISTS "Users can update their own musician record" ON musicians;

CREATE POLICY "Users can view their own musician record"
  ON musicians FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own musician record"
  ON musicians FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own musician record"
  ON musicians FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- Update RLS Policies for consumers
-- ============================================
DROP POLICY IF EXISTS "Users can view their own consumer record" ON consumers;
DROP POLICY IF EXISTS "Users can insert their own consumer record" ON consumers;
DROP POLICY IF EXISTS "Users can update their own consumer record" ON consumers;

CREATE POLICY "Users can view their own consumer record"
  ON consumers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own consumer record"
  ON consumers FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own consumer record"
  ON consumers FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- Verify the changes
-- ============================================
SELECT 'musicians table structure:' AS info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'musicians' 
ORDER BY ordinal_position;

SELECT 'consumers table structure:' AS info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'consumers' 
ORDER BY ordinal_position;
