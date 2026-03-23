import { 
  sendBookingReceivedEmail, 
  sendBookingConfirmedEmail, 
  sendVerificationOtpEmail 
} from "../src/lib/notifications/email-service";
import type { Booking } from "../src/types/database";

// Mock data
const mockBooking: Booking = {
  id: "test-id",
  patient_id: "patient-id",
  patient_name: "Jean Dupont (TEST)",
  patient_email: process.env.ADMIN_EMAIL || "test@example.com",
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

async function runTests() {
  console.log("🚀 Démarrage des tests d'emails...");
  console.log(`📧 Destinataire : ${mockBooking.patient_email}`);

  try {
    console.log("1. Envoi de l'email de RÉCEPTION...");
    await sendBookingReceivedEmail(mockBooking);
    console.log("✅ Email de réception envoyé.");

    console.log("2. Envoi de l'email de CONFIRMATION...");
    await sendBookingConfirmedEmail({ ...mockBooking, status: "confirmed" });
    console.log("✅ Email de confirmation envoyé.");

    console.log("3. Envoi de l'email OTP...");
    await sendVerificationOtpEmail(mockBooking.patient_email, "123456");
    console.log("✅ Email OTP envoyé.");

    console.log("\n✨ Tous les tests sont terminés ! Vérifiez votre boîte de réception.");
  } catch (error) {
    console.error("❌ Erreur lors des tests :", error);
  }
}

runTests();
