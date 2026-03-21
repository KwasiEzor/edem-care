-- =============================================
-- RBAC: Custom Claims & Admin Security
-- =============================================

-- 1. Create Profiles table (if not exists)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT FALSE,
  full_name TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Helper function to check for admin role in JWT
-- This allows us to use it in RLS policies without DB joins
CREATE OR REPLACE FUNCTION has_admin_role()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    COALESCE((auth.jwt() ->> 'is_admin')::boolean, false) = true
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. Trigger to handle new user signups and sync claims
-- In production, you'd manually set is_admin to true for specific users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, is_admin)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    -- Safety: Auto-grant admin to a specific email for bootstrap (CHANGE THIS IN PROD)
    (NEW.email = 'kwasiezor@gmail.com' OR NEW.email = 'admin@edem-care.be')
  );

  -- Set custom claim for the JWT (requires 'supabase-custom-claims' or similar)
  -- Or we can rely on a join if preferred, but JWT is faster for RLS.
  -- For standard Supabase, we'll use a trigger that updates raw_app_metadata.
  
  UPDATE auth.users
  SET raw_app_metadata = raw_app_metadata || 
    jsonb_build_object('is_admin', (NEW.email = 'kwasiezor@gmail.com' OR NEW.email = 'admin@edem-care.be'))
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Set up the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5. Update RLS Policies to use the new RBAC check
-- We replace "authenticated" with our new "has_admin_role()" check

-- Patients
DROP POLICY IF EXISTS "Admin full access patients" ON patients;
CREATE POLICY "Admin full access patients"
  ON patients FOR ALL
  USING (has_admin_role());

-- Bookings (Admin access)
DROP POLICY IF EXISTS "Admin full access bookings" ON bookings;
CREATE POLICY "Admin full access bookings"
  ON bookings FOR ALL
  USING (has_admin_role());

-- Contact Submissions
DROP POLICY IF EXISTS "Admin full access contact_submissions" ON contact_submissions;
CREATE POLICY "Admin full access contact_submissions"
  ON contact_submissions FOR ALL
  USING (has_admin_role());

-- Notifications
DROP POLICY IF EXISTS "Admin full access notifications" ON notifications;
CREATE POLICY "Admin full access notifications"
  ON notifications FOR ALL
  USING (has_admin_role());

-- Time Slots (Admin write access)
DROP POLICY IF EXISTS "Admin full access time_slots" ON time_slots;
CREATE POLICY "Admin full access time_slots"
  ON time_slots FOR ALL
  USING (has_admin_role());

-- Blocked Dates (Admin write access)
DROP POLICY IF EXISTS "Admin full access blocked_dates" ON blocked_dates;
CREATE POLICY "Admin full access blocked_dates"
  ON blocked_dates FOR ALL
  USING (has_admin_role());

-- 6. Enable RLS on Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  USING (has_admin_role());

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 7. Sync existing users (if any)
INSERT INTO public.profiles (id, is_admin)
SELECT id, (email = 'kwasiezor@gmail.com' OR email = 'admin@edem-care.be')
FROM auth.users
ON CONFLICT (id) DO UPDATE SET is_admin = EXCLUDED.is_admin;
