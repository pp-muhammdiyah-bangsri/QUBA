-- QUBA Database Schema
-- Pondok Pesantren Muhammadiyah Bangsri

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM Types
CREATE TYPE user_role AS ENUM ('admin', 'ustadz', 'ortu');
CREATE TYPE jenjang_type AS ENUM ('SMP', 'SMA');
CREATE TYPE jenis_kelamin_type AS ENUM ('L', 'P');
CREATE TYPE status_presensi AS ENUM ('hadir', 'izin', 'sakit', 'alpa');
CREATE TYPE status_perizinan AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE jenis_kegiatan AS ENUM ('pembelajaran', 'kajian', 'event_umum');
CREATE TYPE predikat_tasmi AS ENUM ('mumtaz', 'jayyid', 'maqbul');
CREATE TYPE kategori_mapel AS ENUM ('diniyah', 'umum');

-- Profiles Table (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'ortu',
  linked_santri_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Santri Table
CREATE TABLE santri (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nis TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  jenis_kelamin jenis_kelamin_type NOT NULL,
  alamat TEXT,
  nama_wali TEXT,
  kontak_wali TEXT,
  jenjang jenjang_type NOT NULL,
  status TEXT DEFAULT 'aktif',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asatidz Table
CREATE TABLE asatidz (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  alamat TEXT,
  kontak TEXT,
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hafalan Selesai Table
CREATE TABLE hafalan_selesai (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  santri_id UUID REFERENCES santri(id) ON DELETE CASCADE,
  juz INTEGER NOT NULL CHECK (juz >= 1 AND juz <= 30),
  nilai TEXT,
  penguji_id UUID REFERENCES asatidz(id),
  tanggal DATE NOT NULL,
  catatan TEXT,
  UNIQUE(santri_id, juz)
);

-- Hafalan Lembar Table
CREATE TABLE hafalan_lembar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  santri_id UUID REFERENCES santri(id) ON DELETE CASCADE,
  juz INTEGER NOT NULL CHECK (juz >= 1 AND juz <= 30),
  lembar TEXT NOT NULL,
  penguji_id UUID REFERENCES asatidz(id),
  tanggal DATE NOT NULL,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(santri_id, juz, lembar)
);

-- Hafalan Tasmi Table
CREATE TABLE hafalan_tasmi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  santri_id UUID REFERENCES santri(id) ON DELETE CASCADE,
  juz INTEGER NOT NULL CHECK (juz >= 1 AND juz <= 30),
  tanggal DATE NOT NULL,
  penguji_id UUID REFERENCES asatidz(id),
  predikat predikat_tasmi NOT NULL,
  nilai INTEGER,
  catatan TEXT
);

-- Kegiatan Table
CREATE TABLE kegiatan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  jenis jenis_kegiatan NOT NULL,
  tanggal_mulai TIMESTAMPTZ NOT NULL,
  tanggal_selesai TIMESTAMPTZ,
  lokasi TEXT,
  deskripsi TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Presensi Table
CREATE TABLE presensi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kegiatan_id UUID REFERENCES kegiatan(id) ON DELETE CASCADE,
  santri_id UUID REFERENCES santri(id) ON DELETE CASCADE,
  status status_presensi DEFAULT 'hadir',
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kegiatan_id, santri_id)
);

-- Pelanggaran Table
CREATE TABLE pelanggaran (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  santri_id UUID REFERENCES santri(id) ON DELETE CASCADE,
  deskripsi TEXT NOT NULL,
  poin INTEGER,
  tanggal DATE NOT NULL,
  penyelesaian TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Perizinan Table
CREATE TABLE perizinan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  santri_id UUID REFERENCES santri(id) ON DELETE CASCADE,
  alasan TEXT NOT NULL,
  status status_perizinan DEFAULT 'pending',
  tgl_mulai DATE NOT NULL,
  tgl_selesai DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mapel Table
CREATE TABLE mapel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL UNIQUE,
  kategori kategori_mapel NOT NULL,
  kkm INTEGER DEFAULT 75
);

-- Nilai Table
CREATE TABLE nilai (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  santri_id UUID REFERENCES santri(id) ON DELETE CASCADE,
  mapel_id UUID REFERENCES mapel(id) ON DELETE CASCADE,
  semester TEXT NOT NULL,
  nilai_uh INTEGER,
  nilai_uts INTEGER,
  nilai_uas INTEGER,
  nilai_akhir INTEGER,
  catatan TEXT,
  UNIQUE(santri_id, mapel_id, semester)
);

-- Add foreign key to profiles after santri table exists
ALTER TABLE profiles ADD CONSTRAINT fk_linked_santri 
  FOREIGN KEY (linked_santri_id) REFERENCES santri(id) ON DELETE SET NULL;

-- Trigger: Auto-complete hafalan when 20 lembar are done
CREATE OR REPLACE FUNCTION check_hafalan_completion()
RETURNS TRIGGER AS $$
DECLARE
  lembar_count INTEGER;
  last_penguji UUID;
  last_tanggal DATE;
  first_tanggal DATE;
  duration_days INTEGER;
  duration_text TEXT;
  combined_catatan TEXT;
BEGIN
  -- Count lembar for this santri and juz
  SELECT COUNT(*) INTO lembar_count
  FROM hafalan_lembar
  WHERE santri_id = NEW.santri_id AND juz = NEW.juz;

  -- Get penguji_id and tanggal from the most recent entry
  SELECT penguji_id, tanggal INTO last_penguji, last_tanggal
  FROM hafalan_lembar
  WHERE santri_id = NEW.santri_id AND juz = NEW.juz
  ORDER BY tanggal DESC, id DESC
  LIMIT 1;

  -- Get the earliest tanggal (first record)
  SELECT MIN(tanggal) INTO first_tanggal
  FROM hafalan_lembar
  WHERE santri_id = NEW.santri_id AND juz = NEW.juz;

  -- Aggregate unique catatan content
  SELECT 
    CASE 
      WHEN COUNT(*) > 0 THEN 'Ada beberapa kesalahan seperti ' || STRING_AGG(DISTINCT catatan, ', ' ORDER BY catatan)
      ELSE NULL
    END INTO combined_catatan
  FROM hafalan_lembar
  WHERE santri_id = NEW.santri_id AND juz = NEW.juz AND catatan IS NOT NULL AND catatan != '';

  IF lembar_count >= 20 THEN
    -- Calculate duration in days
    duration_days := last_tanggal - first_tanggal;
    
    -- Format as human-readable text
    IF duration_days = 0 THEN
      duration_text := '1 hari';
    ELSIF duration_days < 30 THEN
      duration_text := duration_days || ' hari';
    ELSIF duration_days < 365 THEN
      duration_text := (duration_days / 30) || ' bulan ' || (duration_days % 30) || ' hari';
    ELSE
      duration_text := (duration_days / 365) || ' tahun ' || ((duration_days % 365) / 30) || ' bulan';
    END IF;

    INSERT INTO hafalan_selesai (santri_id, juz, penguji_id, tanggal, nilai, catatan)
    VALUES (NEW.santri_id, NEW.juz, last_penguji, last_tanggal, duration_text, combined_catatan)
    ON CONFLICT (santri_id, juz) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_hafalan_completion
AFTER INSERT ON hafalan_lembar
FOR EACH ROW EXECUTE FUNCTION check_hafalan_completion();

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE santri ENABLE ROW LEVEL SECURITY;
ALTER TABLE asatidz ENABLE ROW LEVEL SECURITY;
ALTER TABLE hafalan_selesai ENABLE ROW LEVEL SECURITY;
ALTER TABLE hafalan_lembar ENABLE ROW LEVEL SECURITY;
ALTER TABLE hafalan_tasmi ENABLE ROW LEVEL SECURITY;
ALTER TABLE kegiatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE presensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE pelanggaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE perizinan ENABLE ROW LEVEL SECURITY;
ALTER TABLE mapel ENABLE ROW LEVEL SECURITY;
ALTER TABLE nilai ENABLE ROW LEVEL SECURITY;

-- Function to check if user is admin (avoids infinite recursion in RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin can view all profiles" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Admin can manage profiles" ON profiles FOR ALL USING (is_admin());

-- Santri policies
CREATE POLICY "Admin and Ustadz can view all santri" ON santri FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'ustadz'))
);
CREATE POLICY "Ortu can view own child" ON santri FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND linked_santri_id = santri.id)
);
CREATE POLICY "Admin can manage santri" ON santri FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Asatidz policies
CREATE POLICY "All authenticated can view asatidz" ON asatidz FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin can manage asatidz" ON asatidz FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Hafalan policies (Admin and Ustadz can manage, Ortu can view own child)
CREATE POLICY "Admin and Ustadz can manage hafalan_selesai" ON hafalan_selesai FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'ustadz'))
);
CREATE POLICY "Ortu can view own child hafalan" ON hafalan_selesai FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.linked_santri_id = hafalan_selesai.santri_id
  )
);

CREATE POLICY "Admin and Ustadz can manage hafalan_lembar" ON hafalan_lembar FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'ustadz'))
);
CREATE POLICY "Ortu can view own child lembar" ON hafalan_lembar FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.linked_santri_id = hafalan_lembar.santri_id
  )
);

CREATE POLICY "Admin and Ustadz can manage tasmi" ON hafalan_tasmi FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'ustadz'))
);
CREATE POLICY "Ortu can view own child tasmi" ON hafalan_tasmi FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.linked_santri_id = hafalan_tasmi.santri_id
  )
);

-- Kegiatan policies
CREATE POLICY "All authenticated can view kegiatan" ON kegiatan FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin can manage kegiatan" ON kegiatan FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Presensi policies
CREATE POLICY "Admin and Ustadz can manage presensi" ON presensi FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'ustadz'))
);
CREATE POLICY "Ortu can view own child presensi" ON presensi FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.linked_santri_id = presensi.santri_id
  )
);

-- Pelanggaran policies
CREATE POLICY "Admin and Ustadz can manage pelanggaran" ON pelanggaran FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'ustadz'))
);
CREATE POLICY "Ortu can view own child pelanggaran" ON pelanggaran FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.linked_santri_id = pelanggaran.santri_id
  )
);

-- Perizinan policies
CREATE POLICY "Admin and Ustadz can manage perizinan" ON perizinan FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'ustadz'))
);
CREATE POLICY "Ortu can view own child perizinan" ON perizinan FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.linked_santri_id = perizinan.santri_id
  )
);

-- Mapel policies
CREATE POLICY "All authenticated can view mapel" ON mapel FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin can manage mapel" ON mapel FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Nilai policies
CREATE POLICY "Admin and Ustadz can manage nilai" ON nilai FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'ustadz'))
);
CREATE POLICY "Ortu can view own child nilai" ON nilai FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.linked_santri_id = nilai.santri_id
  )
);

-- Create trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'ortu');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();