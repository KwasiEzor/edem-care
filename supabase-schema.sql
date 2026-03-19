-- =============================================
-- Edem-Care Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- Patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  care_type TEXT NOT NULL DEFAULT 'soins_generaux',
  date DATE NOT NULL,
  time_slot_start TIME NOT NULL,
  time_slot_end TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  admin_notes TEXT,
  patient_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact submissions table
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  care_type TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_spam BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time slots table (weekly recurring availability)
CREATE TABLE time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  max_bookings INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blocked dates table
CREATE TABLE blocked_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('new_booking', 'new_contact', 'booking_confirmed', 'booking_cancelled')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_patient_id ON bookings(patient_id);
CREATE INDEX idx_contact_submissions_is_read ON contact_submissions(is_read);
CREATE INDEX idx_time_slots_day ON time_slots(day_of_week);
CREATE INDEX idx_blocked_dates_date ON blocked_dates(date);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_patients
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_bookings
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- AUTO NOTIFICATION TRIGGERS
-- =============================================

-- Create notification on new booking
CREATE OR REPLACE FUNCTION notify_new_booking()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (type, title, message, data)
  VALUES (
    'new_booking',
    'Nouvelle demande de rendez-vous',
    'Demande de ' || NEW.patient_name || ' pour le ' || TO_CHAR(NEW.date, 'DD/MM/YYYY'),
    jsonb_build_object('booking_id', NEW.id, 'patient_name', NEW.patient_name, 'date', NEW.date)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_booking
  AFTER INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION notify_new_booking();

-- Create notification on new contact submission
CREATE OR REPLACE FUNCTION notify_new_contact()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (type, title, message, data)
  VALUES (
    'new_contact',
    'Nouveau message de contact',
    'Message de ' || NEW.name || ' (' || NEW.email || ')',
    jsonb_build_object('contact_id', NEW.id, 'name', NEW.name, 'email', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_contact
  AFTER INSERT ON contact_submissions
  FOR EACH ROW EXECUTE FUNCTION notify_new_contact();

-- =============================================
-- AVAILABLE SLOTS FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION get_available_slots(target_date DATE)
RETURNS TABLE (
  slot_id UUID,
  start_time TIME,
  end_time TIME,
  remaining_spots INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ts.id AS slot_id,
    ts.start_time,
    ts.end_time,
    ts.max_bookings - COALESCE(booking_count.cnt, 0)::INTEGER AS remaining_spots
  FROM time_slots ts
  LEFT JOIN (
    SELECT b.time_slot_start, COUNT(*) AS cnt
    FROM bookings b
    WHERE b.date = target_date
      AND b.status IN ('pending', 'confirmed')
    GROUP BY b.time_slot_start
  ) booking_count ON booking_count.time_slot_start = ts.start_time
  WHERE ts.is_active = TRUE
    AND ts.day_of_week = EXTRACT(DOW FROM target_date)::INTEGER
    AND NOT EXISTS (
      SELECT 1 FROM blocked_dates bd WHERE bd.date = target_date
    )
    AND ts.max_bookings - COALESCE(booking_count.cnt, 0) > 0
  ORDER BY ts.start_time;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Public can insert bookings and contact submissions
CREATE POLICY "Public can insert bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can insert contact submissions"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

-- Public can read time slots and blocked dates (for calendar)
CREATE POLICY "Public can read active time slots"
  ON time_slots FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can read blocked dates"
  ON blocked_dates FOR SELECT
  USING (true);

-- Authenticated admin can do everything
CREATE POLICY "Admin full access patients"
  ON patients FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access bookings"
  ON bookings FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access contact_submissions"
  ON contact_submissions FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access time_slots"
  ON time_slots FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access blocked_dates"
  ON blocked_dates FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access notifications"
  ON notifications FOR ALL
  USING (auth.role() = 'authenticated');

-- =============================================
-- ENABLE REALTIME
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- =============================================
-- SEED: Default time slots (Mon-Fri, 8h-17h, hourly)
-- =============================================

INSERT INTO time_slots (day_of_week, start_time, end_time, is_active, max_bookings)
SELECT
  dow,
  (hour || ':00')::TIME,
  ((hour + 1) || ':00')::TIME,
  TRUE,
  1
FROM generate_series(1, 5) AS dow,
     generate_series(8, 16) AS hour;
