-- Migration script to update existing hafalan_selesai records
-- with the new Nilai (Duration) and Catatan (Aggregated Lembar) formats.

DO $$
DECLARE
  r RECORD;
  lemma_count INTEGER;
  last_penguji UUID;
  last_tanggal DATE;
  first_tanggal DATE;
  duration_days INTEGER;
  duration_text TEXT;
  combined_catatan TEXT;
BEGIN
  -- Loop through all existing records in hafalan_selesai
  FOR r IN SELECT * FROM hafalan_selesai LOOP
    
    -- 1. Calculate Duration (Nilai)
    -- Get the earliest tanggal (first record) for this santri and juz
    SELECT MIN(tanggal) INTO first_tanggal
    FROM hafalan_lembar
    WHERE santri_id = r.santri_id AND juz = r.juz;

    -- Get the latest tanggal (last record)
    SELECT MAX(tanggal) INTO last_tanggal
    FROM hafalan_lembar
    WHERE santri_id = r.santri_id AND juz = r.juz;

    IF first_tanggal IS NOT NULL AND last_tanggal IS NOT NULL THEN
      duration_days := last_tanggal - first_tanggal;
      
      -- Format duration text
      IF duration_days = 0 THEN
        duration_text := '1 hari';
      ELSIF duration_days < 30 THEN
        duration_text := duration_days || ' hari';
      ELSIF duration_days < 365 THEN
        duration_text := (duration_days / 30) || ' bulan ' || (duration_days % 30) || ' hari';
      ELSE
        duration_text := (duration_days / 365) || ' tahun ' || ((duration_days % 365) / 30) || ' bulan';
      END IF;
    ELSE
      duration_text := r.nilai; -- Keep existing if calculation fails
    END IF;

    -- 2. Aggregate Catatan
    SELECT 
      CASE 
        WHEN COUNT(*) > 0 THEN 'Ada beberapa kesalahan seperti ' || STRING_AGG(DISTINCT catatan, ', ' ORDER BY catatan)
        ELSE NULL
      END INTO combined_catatan
    FROM hafalan_lembar
    WHERE santri_id = r.santri_id AND juz = r.juz AND catatan IS NOT NULL AND catatan != '';

    -- 3. Update the record
    UPDATE hafalan_selesai
    SET 
      nilai = duration_text,
      catatan = combined_catatan
    WHERE id = r.id;
    
  END LOOP;
END;
$$;
