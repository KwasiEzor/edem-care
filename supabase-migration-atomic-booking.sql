-- =============================================
-- Atomic Booking & Patient Linking
-- =============================================

CREATE OR REPLACE FUNCTION create_booking_atomic(
  p_patient_name TEXT,
  p_patient_email TEXT,
  p_patient_phone TEXT,
  p_care_type TEXT,
  p_date DATE,
  p_time_slot_start TIME,
  p_time_slot_end TIME,
  p_patient_notes TEXT DEFAULT NULL
) RETURNS bookings AS $$
DECLARE
  v_booking bookings;
  v_available BOOLEAN;
  v_patient_id UUID;
  v_first_name TEXT;
  v_last_name TEXT;
  v_name_parts TEXT[];
BEGIN
  -- 1. Check availability (Atomic check)
  -- This runs within the same transaction as the insert
  SELECT (remaining_spots > 0) INTO v_available
  FROM get_available_slots(p_date)
  WHERE start_time = p_time_slot_start;

  IF v_available IS NOT TRUE THEN
    RAISE EXCEPTION 'Ce créneau n''est plus disponible' USING ERRCODE = 'P0001';
  END IF;

  -- 2. Find or Create Patient (Centralized Logic)
  -- Try to find an existing patient by phone (priority) or email
  SELECT id INTO v_patient_id
  FROM patients
  WHERE (phone IS NOT NULL AND phone = p_patient_phone)
     OR (email IS NOT NULL AND email = p_patient_email)
  ORDER BY created_at DESC
  LIMIT 1;

  -- If not found, create a new patient record
  IF v_patient_id IS NULL THEN
    -- Crude name splitting: first word as first_name, rest as last_name
    v_name_parts := string_to_array(trim(p_patient_name), ' ');
    IF array_length(v_name_parts, 1) > 1 THEN
      v_first_name := v_name_parts[1];
      v_last_name := array_to_string(v_name_parts[2:], ' ');
    ELSE
      v_first_name := '';
      v_last_name := p_patient_name;
    END IF;

    INSERT INTO patients (first_name, last_name, email, phone)
    VALUES (v_first_name, v_last_name, p_patient_email, p_patient_phone)
    RETURNING id INTO v_patient_id;
  END IF;

  -- 3. Insert Booking
  INSERT INTO bookings (
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
    p_date,
    p_time_slot_start,
    p_time_slot_end,
    p_patient_notes,
    'pending'
  ) RETURNING * INTO v_booking;

  RETURN v_booking;
END;
$$ LANGUAGE plpgsql;
