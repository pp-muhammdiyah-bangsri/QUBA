-- Create event table
CREATE TABLE IF NOT EXISTS event (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    judul TEXT NOT NULL,
    deskripsi TEXT,
    tanggal_mulai TIMESTAMP WITH TIME ZONE NOT NULL,
    tanggal_selesai TIMESTAMP WITH TIME ZONE,
    lokasi TEXT,
    jenis TEXT CHECK (jenis IN ('umum', 'akademik', 'keagamaan', 'sosial')),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create informasi table
CREATE TABLE IF NOT EXISTS informasi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    judul TEXT NOT NULL,
    konten TEXT NOT NULL,
    kategori TEXT CHECK (kategori IN ('pengumuman', 'berita', 'info')),
    is_pinned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS
ALTER TABLE event ENABLE ROW LEVEL SECURITY;
ALTER TABLE informasi ENABLE ROW LEVEL SECURITY;

-- Policies (simplified for now: allow all authenticated users)
-- You can refine these later to restrict write access to admins/teachers only
DROP POLICY IF EXISTS "Enable all for authenticated users on event" ON event;
CREATE POLICY "Enable all for authenticated users on event" ON event
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable all for authenticated users on informasi" ON informasi;
CREATE POLICY "Enable all for authenticated users on informasi" ON informasi
    FOR ALL USING (auth.role() = 'authenticated');
