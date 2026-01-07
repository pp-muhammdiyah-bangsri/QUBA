-- Migration: Add Kelas and Halaqoh tables for grouping management
-- Date: 2026-01-06

-- =============================================
-- 1. CREATE KELAS TABLE (Academic Grouping)
-- =============================================
CREATE TABLE IF NOT EXISTS kelas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL UNIQUE,
  tingkat INTEGER NOT NULL CHECK (tingkat >= 7 AND tingkat <= 12),
  wali_kelas_id UUID REFERENCES asatidz(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example Data (Optional - run separately if needed):
-- INSERT INTO kelas (nama, tingkat) VALUES ('7A', 7), ('7B', 7), ('8A', 8), ('8B', 8), ('9A', 9), ('9B', 9);

-- =============================================
-- 2. CREATE HALAQOH TABLE (Dormitory/Quran Grouping)
-- =============================================
CREATE TABLE IF NOT EXISTS halaqoh (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL UNIQUE,
  musyrif_id UUID REFERENCES asatidz(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example Data (Optional - run separately if needed):
-- INSERT INTO halaqoh (nama) VALUES ('Halaqoh Abu Bakar'), ('Halaqoh Umar'), ('Halaqoh Utsman'), ('Halaqoh Ali');

-- =============================================
-- 3. UPDATE SANTRI TABLE (Add Kelas & Halaqoh FK)
-- =============================================
ALTER TABLE santri ADD COLUMN IF NOT EXISTS kelas_id UUID REFERENCES kelas(id) ON DELETE SET NULL;
ALTER TABLE santri ADD COLUMN IF NOT EXISTS halaqoh_id UUID REFERENCES halaqoh(id) ON DELETE SET NULL;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_santri_kelas ON santri(kelas_id);
CREATE INDEX IF NOT EXISTS idx_santri_halaqoh ON santri(halaqoh_id);
CREATE INDEX IF NOT EXISTS idx_kelas_wali ON kelas(wali_kelas_id);
CREATE INDEX IF NOT EXISTS idx_halaqoh_musyrif ON halaqoh(musyrif_id);

-- =============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE halaqoh ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read
DROP POLICY IF EXISTS "Allow read for authenticated" ON kelas;
CREATE POLICY "Allow read for authenticated" ON kelas FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow read for authenticated" ON halaqoh;
CREATE POLICY "Allow read for authenticated" ON halaqoh FOR SELECT TO authenticated USING (true);

-- Allow admins to manage
DROP POLICY IF EXISTS "Allow all for admin" ON kelas;
CREATE POLICY "Allow all for admin" ON kelas FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "Allow all for admin" ON halaqoh;
CREATE POLICY "Allow all for admin" ON halaqoh FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
