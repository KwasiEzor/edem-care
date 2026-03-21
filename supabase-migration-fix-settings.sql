-- ============================================================
-- BULLETPROOF ATOMIC BOOKING SYSTEM
-- ============================================================

-- 1. Ensure extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop all previous versions to prevent signature conflicts
DROP FUNCTION IF EXISTS public.create_booking_atomic(text, text, text, text, date, time, time, text);
DROP FUNCTION IF EXISTS public.create_booking_atomic(text, text, text, text, text, text, text, text);

-- 3. Create the robust function using TEXT parameters for API compatibility
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
  p_patient_name TEXT,
  p_patient_email TEXT,
  p_patient_phone TEXT,
  p_care_type TEXT,
  p_date TEXT,             -- Accept as text
  p_time_slot_start TEXT,  -- Accept as text
  p_time_slot_end TEXT,    -- Accept as text
  p_patient_notes TEXT DEFAULT NULL
) 
RETURNS public.bookings 
LANGUAGE plpgsql
SECURITY DEFINER -- Run with owner privileges
AS $$
DECLARE
  v_booking public.bookings;
  v_available BOOLEAN;
  v_patient_id UUID;
  v_first_name TEXT;
  v_last_name TEXT;
  v_name_parts TEXT[];
  v_date_val DATE;
  v_start_val TIME;
  v_end_val TIME;
BEGIN
  -- Cast inputs once at the start
  v_date_val := p_date::DATE;
  v_start_val := p_time_slot_start::TIME;
  v_end_val := p_time_slot_end::TIME;

  -- 1. Check availability (Atomic check)
  SELECT (remaining_spots > 0) INTO v_available
  FROM public.get_available_slots(v_date_val)
  WHERE start_time = v_start_val;

  IF v_available IS NOT TRUE THEN
    RAISE EXCEPTION 'Ce créneau n''est plus disponible' USING ERRCODE = 'P0001';
  END IF;

  -- 2. Find or Create Patient
  SELECT id INTO v_patient_id
  FROM public.patients
  WHERE (phone IS NOT NULL AND phone = p_patient_phone)
     OR (email IS NOT NULL AND email = p_patient_email)
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_patient_id IS NULL THEN
    v_name_parts := string_to_array(trim(p_patient_name), ' ');
    IF array_length(v_name_parts, 1) > 1 THEN
      v_first_name := v_name_parts[1];
      v_last_name := array_to_string(v_name_parts[2:2147483647], ' ');
    ELSE
      v_first_name := '';
      v_last_name := p_patient_name;
    END IF;

    INSERT INTO public.patients (first_name, last_name, email, phone)
    VALUES (COALESCE(v_first_name, ''), COALESCE(v_last_name, p_patient_name), p_patient_email, p_patient_phone)
    RETURNING id INTO v_patient_id;
  END IF;

  -- 3. Insert Booking
  INSERT INTO public.bookings (
    patient_id,
    patient_name,
    patient_email,
    patient_phone,
    care_type,
    date,
    time_slot_start,
    time_slot_end,
    patient_notes,
    status
  ) VALUES (
    v_patient_id,
    p_patient_name,
    p_patient_email,
    p_patient_phone,
    p_care_type,
    v_date_val,
    v_start_val,
    v_end_val,
    p_patient_notes,
    'pending'
  ) RETURNING * INTO v_booking;

  RETURN v_booking;
END;
$$;

-- 4. Explicitly grant permissions
GRANT EXECUTE ON FUNCTION public.create_booking_atomic TO anon, authenticated, service_role;

-- 5. Fix any missing columns in settings (Separate issue fix)
ALTER TABLE public.admin_settings 
ADD COLUMN IF NOT EXISTS chatbot_model TEXT DEFAULT 'claude-3-5-sonnet-latest';
