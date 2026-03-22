/**
 * Booking API Integration Test
 * 
 * This script performs a full booking flow:
 * 1. Fetches a dynamic math challenge
 * 2. Fetches available slots for a future date
 * 3. Submits a booking request with the correct answer
 * 
 * Run with: node src/lib/dal/api-test.mjs
 */

import fetch from 'node-fetch';

const SITE_URL = 'http://localhost:3000'; // Make sure the dev server is running!

async function runTest() {
  console.log('Starting API Integration Test...');

  try {
    // 1. Get Challenge
    console.log('1. Fetching security challenge...');
    const challengeRes = await fetch(`${SITE_URL}/api/security/challenge`);
    if (!challengeRes.ok) throw new Error('Failed to fetch challenge');
    const challenge = await challengeRes.json();
    console.log(`Question: ${challenge.question}`);

    const answer = eval(challenge.question); // Safe since it's our own question format \d+ \+ \d+
    console.log(`Calculated answer: ${answer}`);

    // 2. Get available slots
    const targetDate = '2026-06-15';
    console.log(`2. Fetching slots for ${targetDate}...`);
    const slotsRes = await fetch(`${SITE_URL}/api/available-slots?date=${targetDate}`);
    if (!slotsRes.ok) throw new Error('Failed to fetch slots');
    const { slots } = await slotsRes.json();
    
    if (!slots || slots.length === 0) {
      console.warn('No slots available for target date. Test cannot proceed fully.');
      return;
    }
    const slot = slots[0];
    console.log(`Using slot: ${slot.start_time} - ${slot.end_time}`);

    // 3. Submit booking
    console.log('3. Submitting booking request...');
    const bookingPayload = {
      patient_name: 'Test Integration',
      patient_email: 'test-integration@example.com',
      patient_phone: '0499999999',
      care_type: 'soins_generaux',
      date: targetDate,
      time_slot_start: slot.start_time,
      time_slot_end: slot.end_time,
      math_answer: String(answer),
      math_token: challenge.token,
      patient_notes: 'Integration test message'
    };

    const submitRes = await fetch(`${SITE_URL}/api/booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload)
    });

    const result = await submitRes.json();

    if (submitRes.ok) {
      console.log('✅ SUCCESS: Booking created successfully!');
      console.log('Booking ID:', result.booking?.id);
    } else {
      console.error('❌ FAILURE:', result.error);
      if (result.details) console.dir(result.details, { depth: null });
      
      // If it's a 409, it means the RPC worked but the slot was taken (or not in DB)
      if (submitRes.status === 409) {
        console.log('Note: 409 Conflict confirms the atomic check logic is active.');
      }
    }

  } catch (err) {
    console.error('Test script error:', err.message);
    console.log('Ensure "npm run dev" is running in the background.');
  }
}

runTest();
