-- Scalability Indexes for QUBA App
-- Run this in Supabase SQL Editor

-- =============================================
-- PRESENSI TABLE INDEXES
-- =============================================
-- For filtering by santri
CREATE INDEX IF NOT EXISTS idx_presensi_santri_id ON presensi(santri_id);

-- For filtering by kegiatan
CREATE INDEX IF NOT EXISTS idx_presensi_kegiatan_id ON presensi(kegiatan_id);

-- For date-based queries (monthly rekap)
CREATE INDEX IF NOT EXISTS idx_presensi_created_at ON presensi(created_at);

-- Composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_presensi_santri_kegiatan ON presensi(santri_id, kegiatan_id);

-- =============================================
-- HAFALAN TABLES INDEXES
-- =============================================
-- Hafalan lembar lookups
CREATE INDEX IF NOT EXISTS idx_hafalan_lembar_santri_id ON hafalan_lembar(santri_id);
CREATE INDEX IF NOT EXISTS idx_hafalan_lembar_tanggal ON hafalan_lembar(tanggal);

-- Hafalan selesai lookups
CREATE INDEX IF NOT EXISTS idx_hafalan_selesai_santri_id ON hafalan_selesai(santri_id);
CREATE INDEX IF NOT EXISTS idx_hafalan_selesai_tanggal ON hafalan_selesai(tanggal);

-- Tasmi lookups
CREATE INDEX IF NOT EXISTS idx_tasmi_santri_id ON tasmi(santri_id);

-- =============================================
-- KESANTRIAN TABLES INDEXES
-- =============================================
-- Pelanggaran lookups
CREATE INDEX IF NOT EXISTS idx_pelanggaran_santri_id ON pelanggaran(santri_id);
CREATE INDEX IF NOT EXISTS idx_pelanggaran_tanggal ON pelanggaran(tanggal);

-- Perizinan lookups
CREATE INDEX IF NOT EXISTS idx_perizinan_santri_id ON perizinan(santri_id);
CREATE INDEX IF NOT EXISTS idx_perizinan_status ON perizinan(status);

-- =============================================
-- SANTRI TABLE INDEXES
-- =============================================
-- For filtering by status
CREATE INDEX IF NOT EXISTS idx_santri_status ON santri(status);

-- For filtering by kelas/halaqoh
CREATE INDEX IF NOT EXISTS idx_santri_kelas_id ON santri(kelas_id);
CREATE INDEX IF NOT EXISTS idx_santri_halaqoh_id ON santri(halaqoh_id);

-- For gender-based queries
CREATE INDEX IF NOT EXISTS idx_santri_jenis_kelamin ON santri(jenis_kelamin);

-- =============================================
-- NOTIFICATIONS INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_notifications_target_role ON notifications(target_role);
CREATE INDEX IF NOT EXISTS idx_notifications_target_santri_id ON notifications(target_santri_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- =============================================
-- NOTIFICATION DISMISSALS INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_notification_dismissals_user_id ON notification_dismissals(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_dismissals_notification_id ON notification_dismissals(notification_id);

-- =============================================
-- KEGIATAN TABLE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_kegiatan_tanggal_mulai ON kegiatan(tanggal_mulai);
CREATE INDEX IF NOT EXISTS idx_kegiatan_nama ON kegiatan(nama);

-- =============================================
-- EVENT TABLE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_event_tanggal_mulai ON event(tanggal_mulai);

-- =============================================
-- PROFILES TABLE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_linked_santri_id ON profiles(linked_santri_id);
