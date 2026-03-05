-- ============================================
-- Fix RLS Policies for Profiles Table
-- Run this if you're getting "row-level security policy" errors
-- ============================================
-- This script fixes Row Level Security policies that might be blocking profile creation

-- First, drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Recreate SELECT policy - users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Recreate INSERT policy - users can insert their own profile
-- The WITH CHECK ensures the id matches the authenticated user's id
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Recreate UPDATE policy - users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- Verify the trigger function has proper permissions
-- ============================================
-- The trigger function should already be SECURITY DEFINER, but let's make sure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (
    NEW.id,
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Test: Check if RLS is enabled
-- ============================================
-- Run this to verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'profiles';

-- ============================================
-- If you still have issues, you can temporarily disable RLS to test:
-- ============================================
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- (Then re-enable it after testing: ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;)
