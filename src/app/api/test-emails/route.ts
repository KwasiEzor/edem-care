import { NextResponse } from "next/server";
import { 
  sendBookingReceivedEmail, 
  sendBookingConfirmedEmail, 
  sendVerificationOtpEmail 
} from "@/lib/notifications/email-service";
import { createClient } from "@/lib/supabase/server";
import { Booking } from "@/types/database";

export async function GET() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock data
  const mockBooking: Booking = {
    id: "test-id",
    patient_id: "patient-id",
    patient_name: "Jean Dupont (TEST)",
    patient_email: "test@example.com",
    patient_phone: "+32 400 00 00 00",
    care_type: "prise_de_sang",
    date: "2026-04-15",
    time_slot_start: "09:00:00",
    time_slot_end: "09:30:00",
    patient_notes: "Ceci est un test pour vérifier le nouveau template d'email.",
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    admin_notes: null
  };
  try {
    await sendBookingReceivedEmail(mockBooking);
    await sendBookingConfirmedEmail({ ...mockBooking, status: "confirmed" });
    await sendVerificationOtpEmail(mockBooking.patient_email, "123456");

    return NextResponse.json({ 
      success: true, 
      message: `3 emails de test envoyés à ${mockBooking.patient_email}.` 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
