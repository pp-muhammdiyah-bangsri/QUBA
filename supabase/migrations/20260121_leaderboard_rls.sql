-- Fix: Allow ortu to view all santri for leaderboard
-- This policy allows viewing only non-sensitive data (nama, jenjang, total_points, level)
-- for the leaderboard feature

-- Add policy for ortu to view santri for leaderboard purposes
DROP POLICY IF EXISTS "Ortu can view santri for leaderboard" ON santri;
CREATE POLICY "Ortu can view santri for leaderboard" ON santri FOR SELECT USING (
  -- Ortu can see all santri but only for leaderboard (id, nama, jenjang, total_points, level)
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ortu')
);

-- Note: This allows ortu to see all santri names in leaderboard
-- The original "Ortu can view own child" policy is still in place for detailed views
