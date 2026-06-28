
-- Live location columns for musicians (map / Go Live)

ALTER TABLE musicians
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS is_live BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS live_started_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_musicians_live_location
  ON musicians (is_live, latitude, longitude)
  WHERE is_live = true;

-- Consumers (and other authenticated users) can read live musician pins on the map.
DROP POLICY IF EXISTS "Authenticated users can view live musicians on map" ON musicians;

CREATE POLICY "Authenticated users can view live musicians on map"
  ON musicians FOR SELECT
  TO authenticated
  USING (
    is_live = true
    AND latitude IS NOT NULL
    AND longitude IS NOT NULL
  );
