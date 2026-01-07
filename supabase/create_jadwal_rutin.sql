-- Create jadwal_rutin table
CREATE TABLE IF NOT EXISTS jadwal_rutin (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_kegiatan TEXT NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    hari_aktif INTEGER[] NOT NULL, -- 1=Monday, 7=Sunday
    kode_presensi TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add relation to kegiatan table
ALTER TABLE kegiatan 
ADD COLUMN IF NOT EXISTS jadwal_rutin_id UUID REFERENCES jadwal_rutin(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE jadwal_rutin ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Allow read for authenticated" ON jadwal_rutin;
CREATE POLICY "Allow read for authenticated" ON jadwal_rutin FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow all for admin" ON jadwal_rutin;
CREATE POLICY "Allow all for admin" ON jadwal_rutin FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
