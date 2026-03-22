/**
 * Booking Concurrency Stress Test
 * 
 * This script attempts to book the same slot multiple times simultaneously
 * to verify that the atomic RPC 'create_booking_atomic' correctly handles 
 * race conditions and prevents double-booking.
 * 
 * Run with: node src/lib/dal/concurrency-test.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  const targetDate = '2026-06-01'; // Future date
  const timeStart = '10:00:00';
  const timeEnd = '11:00:00';

  console.log('Testing connectivity by calling get_available_slots...');
  const { data: slots, error: slotsError } = await supabase.rpc('get_available_slots', {
    target_date: targetDate
  });

  if (slotsError) {
    console.error('get_available_slots failed:', slotsError);
    return;
  }
  console.log('get_available_slots worked. Function found.');

  console.log(`Starting concurrency test for ${targetDate} at ${timeStart}...`);

  // 1. Prepare: Ensure the slot is available in time_slots and no bookings exist for it
  const dow = new Date(targetDate).getDay();
  
  // Ensure time slot exists
  await supabase.from('time_slots').upsert({
    day_of_week: dow,
    start_time: timeStart,
    end_time: timeEnd,
    is_active: true,
    max_bookings: 1
  }, { onConflict: 'day_of_week,start_time' });

  // Delete any existing bookings for this slot to start clean
  await supabase.from('bookings').delete().eq('date', targetDate).eq('time_slot_start', timeStart);

  console.log('Environment prepared. Sending 5 simultaneous booking requests...');

  const requests = Array.from({ length: 5 }).map((_, i) => {
    // Calling RPC with a single JSON object often works better with PostgREST
    // when multiple overloaded signatures exist.
    return supabase.rpc('create_booking_atomic', {
      p_patient_name: `Test Patient ${i}`,
      p_patient_email: `test${i}@example.com`,
      p_patient_phone: `040000000${i}`,
      p_care_type: 'soins_generaux',
      p_date: String(targetDate),
      p_time_slot_start: String(timeStart),
      p_time_slot_end: String(timeEnd),
      p_patient_notes: 'Test notes'
    });
  });

  const results = await Promise.all(requests);

  const successes = results.filter(r => !r.error);
  const failures = results.filter(r => r.error);

  console.log('\nResults:');
  console.log(`- Successes: ${successes.length}`);
  console.log(`- Failures: ${failures.length}`);

  if (successes.length > 1) {
    console.error('❌ FAILURE: Multiple bookings allowed for the same slot!');
    process.exit(1);
  } else if (successes.length === 1) {
    console.log('✅ SUCCESS: Only one booking was allowed.');
  } else {
    console.warn('⚠️ WARNING: No bookings succeeded. Check RPC errors.');
    console.log('First error:', failures[0]?.error);
  }

  // Cleanup
  await supabase.from('bookings').delete().eq('date', targetDate).eq('time_slot_start', timeStart);
}

runTest().catch(console.error);
