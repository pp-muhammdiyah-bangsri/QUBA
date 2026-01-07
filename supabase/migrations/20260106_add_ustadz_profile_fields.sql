-- Migration: Add Profile Fields to Asatidz
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE asatidz ADD COLUMN IF NOT EXISTS biografi TEXT;
ALTER TABLE asatidz ADD COLUMN IF NOT EXISTS pendidikan TEXT;
ALTER TABLE asatidz ADD COLUMN IF NOT EXISTS keahlian TEXT;
ALTER TABLE asatidz ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- Example data (optional)
-- UPDATE asatidz SET biografi = 'Lulusan Pondok Modern Gontor' WHERE id = 'xxx';
