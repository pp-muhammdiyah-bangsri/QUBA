-- Function to check if the current user is an admin
-- SECURITY DEFINER allows this function to bypass RLS policies
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

-- Update profiles policies to use the new function
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can manage profiles" ON profiles;

CREATE POLICY "Admin can view all profiles" ON profiles FOR SELECT USING (
  is_admin()
);

CREATE POLICY "Admin can manage profiles" ON profiles FOR ALL USING (
  is_admin()
);

-- Update other policies where "Admin" check is used to use is_admin() for cleaner code and performance
-- ensuring no other recursion is happening
