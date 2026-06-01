-- ============================================
-- Consumer discovery: follows, geo columns, RLS
-- Run in Supabase SQL Editor after supabase_setup.sql
-- ============================================

-- Geo + live status on musicians (for nearby discovery)
ALTER TABLE musicians ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE musicians ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE musicians ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_musicians_is_live ON musicians(is_live) WHERE is_live = TRUE;
CREATE INDEX IF NOT EXISTS idx_musicians_lat_lng ON musicians(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- ============================================
-- consumer_follows
-- ============================================
CREATE TABLE IF NOT EXISTS consumer_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consumer_id UUID NOT NULL REFERENCES consumers(id) ON DELETE CASCADE,
  musician_id UUID NOT NULL REFERENCES musicians(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (consumer_id, musician_id)
);

CREATE INDEX IF NOT EXISTS idx_consumer_follows_consumer ON consumer_follows(consumer_id);
CREATE INDEX IF NOT EXISTS idx_consumer_follows_musician ON consumer_follows(musician_id);

ALTER TABLE consumer_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Consumers can view own follows" ON consumer_follows;
DROP POLICY IF EXISTS "Consumers can insert own follows" ON consumer_follows;
DROP POLICY IF EXISTS "Consumers can delete own follows" ON consumer_follows;
DROP POLICY IF EXISTS "Musicians can view their followers" ON consumer_follows;

CREATE POLICY "Consumers can view own follows"
  ON consumer_follows FOR SELECT
  USING (auth.uid() = consumer_id);

CREATE POLICY "Consumers can insert own follows"
  ON consumer_follows FOR INSERT
  WITH CHECK (auth.uid() = consumer_id);

CREATE POLICY "Consumers can delete own follows"
  ON consumer_follows FOR DELETE
  USING (auth.uid() = consumer_id);

CREATE POLICY "Musicians can view their followers"
  ON consumer_follows FOR SELECT
  USING (auth.uid() = musician_id);

-- ============================================
-- Allow authenticated users to discover musicians
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view musicians for discovery" ON musicians;

CREATE POLICY "Authenticated users can view musicians for discovery"
  ON musicians FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Avatars for musician profile cards (profiles.id = musicians.id)
DROP POLICY IF EXISTS "Authenticated users can view profile avatars" ON profiles;

CREATE POLICY "Authenticated users can view profile avatars"
  ON profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);
