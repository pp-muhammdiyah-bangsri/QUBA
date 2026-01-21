-- Migration: Sync Ortu Profile Names
-- Updates ortu profiles that have email-based names to proper "Wali (santri name)" format

-- Update profiles where full_name looks like an email (contains @)
-- and role is 'ortu' and has linked_santri_id
UPDATE profiles p
SET full_name = COALESCE(
    (SELECT s.nama_wali FROM santri s WHERE s.id = p.linked_santri_id),
    'Wali ' || (SELECT s.nama FROM santri s WHERE s.id = p.linked_santri_id)
)
WHERE p.role = 'ortu'
  AND p.linked_santri_id IS NOT NULL
  AND (
    p.full_name LIKE '%@%'  -- Email format
    OR p.full_name IS NULL
    OR p.full_name = ''
    OR p.full_name LIKE '20%@%'  -- NIS-based email format like 202511001@quba.app
  );

-- Also update any ortu profile that is still using the email pattern
UPDATE profiles p
SET full_name = COALESCE(
    (SELECT s.nama_wali FROM santri s WHERE s.id = p.linked_santri_id),
    'Wali ' || (SELECT s.nama FROM santri s WHERE s.id = p.linked_santri_id)
)
WHERE p.role = 'ortu'
  AND p.linked_santri_id IS NOT NULL
  AND p.full_name = p.email;

-- Create a trigger to auto-update profile name when santri nama_wali changes
CREATE OR REPLACE FUNCTION sync_ortu_profile_name()
RETURNS TRIGGER AS $$
BEGIN
    -- If nama_wali changed, update the linked profile
    IF NEW.nama_wali IS DISTINCT FROM OLD.nama_wali OR NEW.nama IS DISTINCT FROM OLD.nama THEN
        UPDATE profiles
        SET full_name = COALESCE(NEW.nama_wali, 'Wali ' || NEW.nama)
        WHERE linked_santri_id = NEW.id
          AND role = 'ortu';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_ortu_name ON santri;
CREATE TRIGGER trigger_sync_ortu_name
AFTER UPDATE ON santri
FOR EACH ROW EXECUTE FUNCTION sync_ortu_profile_name();

-- Log how many profiles were updated
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM profiles
    WHERE role = 'ortu'
      AND linked_santri_id IS NOT NULL
      AND full_name NOT LIKE '%@%'
      AND full_name IS NOT NULL;
    
    RAISE NOTICE 'Total ortu profiles now properly named: %', v_count;
END $$;
