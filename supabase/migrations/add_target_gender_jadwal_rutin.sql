-- Migration: Add target_gender column to jadwal_rutin table
-- This allows schedules to be applied to specific gender groups

ALTER TABLE jadwal_rutin 
ADD COLUMN IF NOT EXISTS target_gender TEXT DEFAULT 'all' 
CHECK (target_gender IN ('all', 'L', 'P'));

-- Update existing rows to have 'all' as default
UPDATE jadwal_rutin SET target_gender = 'all' WHERE target_gender IS NULL;
