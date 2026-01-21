-- Migration: Gamifikasi System
-- Creates tables for badges, santri_badges, and points_log

-- ENUM untuk kategori badge
DO $$ BEGIN
    CREATE TYPE badge_category AS ENUM ('hafalan', 'presensi', 'adab', 'khusus');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabel badges (daftar badge yang tersedia)
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  deskripsi TEXT,
  icon TEXT NOT NULL,
  kategori badge_category NOT NULL,
  poin INTEGER DEFAULT 100,
  syarat JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel santri_badges (badge yang dimiliki santri)
CREATE TABLE IF NOT EXISTS santri_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  santri_id UUID REFERENCES santri(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(santri_id, badge_id)
);

-- Tabel points_log (riwayat poin)
CREATE TABLE IF NOT EXISTS points_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  santri_id UUID REFERENCES santri(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  badge_id UUID REFERENCES badges(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tambah kolom di tabel santri (jika belum ada)
DO $$ BEGIN
    ALTER TABLE santri ADD COLUMN total_points INTEGER DEFAULT 0;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE santri ADD COLUMN level INTEGER DEFAULT 1;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_santri_badges_santri ON santri_badges(santri_id);
CREATE INDEX IF NOT EXISTS idx_santri_badges_badge ON santri_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_points_log_santri ON points_log(santri_id);
CREATE INDEX IF NOT EXISTS idx_santri_points ON santri(total_points DESC);

-- RLS Policies
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE santri_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "All can view badges" ON badges;
DROP POLICY IF EXISTS "Admin can manage badges" ON badges;
DROP POLICY IF EXISTS "All can view santri_badges" ON santri_badges;
DROP POLICY IF EXISTS "Admin and Ustadz can manage santri_badges" ON santri_badges;
DROP POLICY IF EXISTS "All can view points_log" ON points_log;
DROP POLICY IF EXISTS "Admin can manage points_log" ON points_log;

-- Badges: semua bisa lihat
CREATE POLICY "All can view badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Admin can manage badges" ON badges FOR ALL USING (is_admin());

-- Santri badges: semua authenticated bisa lihat
CREATE POLICY "All can view santri_badges" ON santri_badges FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin and Ustadz can manage santri_badges" ON santri_badges FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'ustadz')));

-- Points log
CREATE POLICY "All can view points_log" ON points_log FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin can manage points_log" ON points_log FOR ALL USING (is_admin());

-- Seed default badges
INSERT INTO badges (code, nama, deskripsi, icon, kategori, poin, syarat) VALUES
-- Badge Hafalan
('hafalan_juz_1', 'Penghafal Pertama', 'Menyelesaikan Hafalan 1 Juz Al-Qur''an', '🌟', 'hafalan', 100, '{"type": "hafalan_juz", "value": 1}'),
('hafalan_juz_5', 'Khatam 5 Juz', 'Menyelesaikan Hafalan 5 Juz Al-Qur''an', '📖', 'hafalan', 500, '{"type": "hafalan_juz", "value": 5}'),
('hafalan_juz_10', 'Setengah Jalan', 'Menyelesaikan Hafalan 10 Juz Al-Qur''an', '📗', 'hafalan', 1000, '{"type": "hafalan_juz", "value": 10}'),
('hafalan_juz_15', 'Separuh Quran', 'Menyelesaikan Hafalan 15 Juz Al-Qur''an', '📘', 'hafalan', 1500, '{"type": "hafalan_juz", "value": 15}'),
('hafalan_juz_20', 'Hampir Sempurna', 'Menyelesaikan Hafalan 20 Juz Al-Qur''an', '📙', 'hafalan', 2000, '{"type": "hafalan_juz", "value": 20}'),
('hafalan_juz_30', 'Hafidz', 'Menyelesaikan Hafalan 30 Juz Al-Qur''an', '🏆', 'hafalan', 5000, '{"type": "hafalan_juz", "value": 30}'),
('mumtaz_5', 'Mumtaz Starter', '5x predikat Mumtaz di tasmi', '⭐', 'hafalan', 150, '{"type": "mumtaz_count", "value": 5}'),
('mumtaz_10', 'Mumtaz Master', '10x predikat Mumtaz di tasmi', '🥇', 'hafalan', 300, '{"type": "mumtaz_count", "value": 10}'),
('mumtaz_20', 'Mumtaz Legend', '20x predikat Mumtaz di tasmi', '👑', 'hafalan', 500, '{"type": "mumtaz_count", "value": 20}'),

-- Badge Presensi  
('sholat_perfect_month', 'Rajin Sholat', 'Kehadiran sholat 100% selama 1 bulan', '🕌', 'presensi', 200, '{"type": "sholat_perfect", "value": 1}'),
('halaqoh_perfect_month', 'Penuntut Ilmu', 'Kehadiran halaqoh 100% selama 1 bulan', '📚', 'presensi', 150, '{"type": "halaqoh_perfect", "value": 1}'),

-- Badge Adab
('zero_violation_1', 'Santri Teladan', '1 bulan tanpa pelanggaran', '😇', 'adab', 150, '{"type": "zero_violation_months", "value": 1}'),
('zero_violation_3', 'Akhlak Mulia', '3 bulan tanpa pelanggaran', '✨', 'adab', 300, '{"type": "zero_violation_months", "value": 3}'),
('zero_violation_6', 'Qudwah Hasanah', '6 bulan tanpa pelanggaran', '🌙', 'adab', 500, '{"type": "zero_violation_months", "value": 6}')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- SYNC: Award badges based on existing data
-- ============================================

-- Function to sync badges for a santri
CREATE OR REPLACE FUNCTION sync_santri_badges(p_santri_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_hafalan_count INTEGER;
    v_mumtaz_count INTEGER;
    v_badge RECORD;
    v_awarded INTEGER := 0;
    v_total_points INTEGER := 0;
BEGIN
    -- Count hafalan selesai
    SELECT COUNT(*) INTO v_hafalan_count 
    FROM hafalan_selesai WHERE santri_id = p_santri_id;
    
    -- Count mumtaz tasmi
    SELECT COUNT(*) INTO v_mumtaz_count 
    FROM hafalan_tasmi WHERE santri_id = p_santri_id AND predikat = 'mumtaz';
    
    -- Loop through all badges
    FOR v_badge IN SELECT * FROM badges LOOP
        -- Check if already has this badge
        IF NOT EXISTS (
            SELECT 1 FROM santri_badges 
            WHERE santri_id = p_santri_id AND badge_id = v_badge.id
        ) THEN
            -- Check eligibility based on syarat type
            IF v_badge.syarat IS NOT NULL THEN
                IF (v_badge.syarat->>'type' = 'hafalan_juz' AND v_hafalan_count >= (v_badge.syarat->>'value')::integer) OR
                   (v_badge.syarat->>'type' = 'mumtaz_count' AND v_mumtaz_count >= (v_badge.syarat->>'value')::integer)
                THEN
                    -- Award badge
                    INSERT INTO santri_badges (santri_id, badge_id) 
                    VALUES (p_santri_id, v_badge.id);
                    
                    -- Log points
                    INSERT INTO points_log (santri_id, amount, reason, badge_id)
                    VALUES (p_santri_id, v_badge.poin, 'Badge: ' || v_badge.nama, v_badge.id);
                    
                    v_total_points := v_total_points + v_badge.poin;
                    v_awarded := v_awarded + 1;
                END IF;
            END IF;
        END IF;
    END LOOP;
    
    -- Update santri total points
    IF v_total_points > 0 THEN
        UPDATE santri 
        SET total_points = COALESCE(total_points, 0) + v_total_points,
            level = CASE 
                WHEN COALESCE(total_points, 0) + v_total_points >= 5001 THEN 5
                WHEN COALESCE(total_points, 0) + v_total_points >= 3001 THEN 4
                WHEN COALESCE(total_points, 0) + v_total_points >= 1501 THEN 3
                WHEN COALESCE(total_points, 0) + v_total_points >= 501 THEN 2
                ELSE 1
            END
        WHERE id = p_santri_id;
    END IF;
    
    RETURN v_awarded;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sync all existing santri
DO $$
DECLARE
    v_santri RECORD;
    v_total_synced INTEGER := 0;
    v_badges_awarded INTEGER;
BEGIN
    FOR v_santri IN SELECT id FROM santri WHERE status = 'aktif' LOOP
        SELECT sync_santri_badges(v_santri.id) INTO v_badges_awarded;
        IF v_badges_awarded > 0 THEN
            v_total_synced := v_total_synced + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Synced badges for % santri', v_total_synced;
END $$;

-- Create trigger to auto-award badges when hafalan_selesai is inserted
CREATE OR REPLACE FUNCTION trigger_award_hafalan_badge()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM sync_santri_badges(NEW.santri_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_hafalan_badge ON hafalan_selesai;
CREATE TRIGGER trigger_hafalan_badge
AFTER INSERT ON hafalan_selesai
FOR EACH ROW EXECUTE FUNCTION trigger_award_hafalan_badge();

-- Create trigger to auto-award badges when tasmi mumtaz is inserted
CREATE OR REPLACE FUNCTION trigger_award_tasmi_badge()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.predikat = 'mumtaz' THEN
        PERFORM sync_santri_badges(NEW.santri_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_tasmi_badge ON hafalan_tasmi;
CREATE TRIGGER trigger_tasmi_badge
AFTER INSERT ON hafalan_tasmi
FOR EACH ROW EXECUTE FUNCTION trigger_award_tasmi_badge();

