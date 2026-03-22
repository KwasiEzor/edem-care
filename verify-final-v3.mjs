import { createClient } from '@supabase/supabase-js';

async function verify() {
  const url = 'https://ynsdblrotukvjuksxosz.supabase.co';
  const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inluc2RibHJvdHVrdmp1a3N4b3N6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkwNjY4OCwiZXhwIjoyMDg5NDgyNjg4fQ.maopMn0trt5TY5W_AYlbZgkYTpsx919crlGvFohU-qk';
  
  const supabase = createClient(url, key);

  console.log('Final Verification check...');

  // Match the exact call pattern from the API
  const { error } = await supabase.rpc('create_booking_atomic', {
    p_patient_name: 'Final Test',
    p_patient_email: 'final@test.com',
    p_patient_phone: '12345',
    p_care_type: 'autre',
    p_date: '2026-12-31', 
    p_time_slot_start: '10:00:00',
    p_time_slot_end: '11:00:00',
    p_patient_notes: null
  });

  if (error) {
    if (error.message.includes('Could not find the function')) {
      console.error('❌ FAILED: The function is STILL not found.');
      console.log('Please refresh your Supabase dashboard and verify the SQL editor output again.');
      process.exit(1);
    }
    
    // Any other error means the function is FOUND
    console.log('✅ SUCCESS: The function is now correctly installed and reachable!');
    console.log('Error returned by function (proves it exists):', error.message);
  } else {
    console.log('✅ SUCCESS: The function exists and executed perfectly!');
  }
}

verify();
