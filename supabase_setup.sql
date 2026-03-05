-- ============================================
-- Supabase Database Setup Script
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Create profiles table
-- ============================================
-- Note: full_name is not stored here - it's stored in musicians/consumers tables
-- Email is the primary identifier for authentication
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. Create musicians table
-- ============================================
CREATE TABLE IF NOT EXISTS musicians (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artist_name TEXT,
  genre TEXT,
  bio TEXT,
  location TEXT,
  birthday DATE,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. Create consumers table
-- ============================================
CREATE TABLE IF NOT EXISTS consumers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  preferred_genre TEXT,
  location TEXT,
  birthday DATE,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. Create function to update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. Create triggers for updated_at
-- ============================================
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_musicians_updated_at
  BEFORE UPDATE ON musicians
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consumers_updated_at
  BEFORE UPDATE ON consumers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. Create function to automatically create profile on signup
-- ============================================
-- This function runs with SECURITY DEFINER to bypass RLS
-- It uses ON CONFLICT to handle cases where profile might already exist
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
-- 7. Create trigger to call function on new user signup
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 8. Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE musicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. Create RLS Policies for profiles table
-- ============================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile
-- Allow insert if the id matches the authenticated user's id
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow service role to insert profiles (for trigger function)
-- This is handled by SECURITY DEFINER in the trigger function, but we ensure the policy allows it

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 10. Create RLS Policies for musicians table
-- ============================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own musician record" ON musicians;
DROP POLICY IF EXISTS "Users can insert their own musician record" ON musicians;
DROP POLICY IF EXISTS "Users can update their own musician record" ON musicians;

-- Users can view their own musician record
CREATE POLICY "Users can view their own musician record"
  ON musicians FOR SELECT
  USING (auth.uid() = profile_id);

-- Users can insert their own musician record
CREATE POLICY "Users can insert their own musician record"
  ON musicians FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Users can update their own musician record
CREATE POLICY "Users can update their own musician record"
  ON musicians FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- ============================================
-- 11. Create RLS Policies for consumers table
-- ============================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own consumer record" ON consumers;
DROP POLICY IF EXISTS "Users can insert their own consumer record" ON consumers;
DROP POLICY IF EXISTS "Users can update their own consumer record" ON consumers;

-- Users can view their own consumer record
CREATE POLICY "Users can view their own consumer record"
  ON consumers FOR SELECT
  USING (auth.uid() = profile_id);

-- Users can insert their own consumer record
CREATE POLICY "Users can insert their own consumer record"
  ON consumers FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Users can update their own consumer record
CREATE POLICY "Users can update their own consumer record"
  ON consumers FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- ============================================
-- 12. Create indexes for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_musicians_profile_id ON musicians(profile_id);
CREATE INDEX IF NOT EXISTS idx_consumers_profile_id ON consumers(profile_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ============================================
-- Setup Complete!
-- ============================================
-- Your database is now set up with:
-- 1. profiles table with full_name and email columns
-- 2. musicians table
-- 3. consumers table
-- 4. Automatic profile creation on user signup
-- 5. Row Level Security policies
-- 6. Updated_at triggers
-- ============================================
