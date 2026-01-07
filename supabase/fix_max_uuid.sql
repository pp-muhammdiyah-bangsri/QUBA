-- Fix for "function max(uuid) does not exist" error
-- The check_hafalan_completion trigger uses MAX(penguji_id) but MAX doesn't work on UUID type

-- Step 1: Add created_at column to hafalan_lembar if it doesn't exist
ALTER TABLE hafalan_lembar ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Step 2: Drop existing trigger first
DROP TRIGGER IF EXISTS trigger_hafalan_completion ON hafalan_lembar;
DROP FUNCTION IF EXISTS check_hafalan_completion();

-- Step 3: Recreate the function with duration calculation and catatan aggregation
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

-- Step 4: Recreate the trigger
CREATE TRIGGER trigger_hafalan_completion
AFTER INSERT ON hafalan_lembar
FOR EACH ROW EXECUTE FUNCTION check_hafalan_completion();
