import "server-only";
import { Resend } from "resend";
import { env } from "@/lib/env";
import { 
  buildEmailSubject, 
  buildEmailHtml,
  MessageContext
} from "./messages";
import { Booking } from "@/types/database";

/**
 * Common helper to send an email via Resend
 */
async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!env.RESEND_API_KEY) {
    console.warn("[email-service] RESEND_API_KEY not set. Email not sent.");
    return { success: false, error: "Missing API key" };
  }

  const resend = new Resend(env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: "Edem-Care <notifications@edem-care.be>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[email-service] Resend error:", error);
      return { success: false, error };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error("[email-service] Unexpected error:", error);
    return { success: false, error };
  }
}

/**
 * Sends an email to the patient when a booking is received
 */
export async function sendBookingReceivedEmail(booking: Booking) {
  const ctx: MessageContext = {
    event: "booking_created",
    patientName: booking.patient_name,
    careType: booking.care_type,
    date: booking.date,
    timeStart: booking.time_slot_start,
    timeEnd: booking.time_slot_end,
  };

  return sendEmail({
    to: booking.patient_email,
    subject: buildEmailSubject(ctx.event),
    html: buildEmailHtml(ctx),
  });
}

/**
 * Sends an email to the patient when a booking is confirmed
 */
export async function sendBookingConfirmedEmail(booking: Booking) {
  const ctx: MessageContext = {
    event: "booking_confirmed",
    patientName: booking.patient_name,
    careType: booking.care_type,
    date: booking.date,
    timeStart: booking.time_slot_start,
    timeEnd: booking.time_slot_end,
    adminNotes: booking.admin_notes,
  };

  return sendEmail({
    to: booking.patient_email,
    subject: buildEmailSubject(ctx.event),
    html: buildEmailHtml(ctx),
  });
}

/**
 * Sends a verification OTP email
 */
export async function sendVerificationOtpEmail(email: string, otp: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0b4da2;">Vérification de votre compte</h2>
      <p>Bonjour,</p>
      <p>Voici votre code de vérification pour accéder à votre espace Edem-Care :</p>
      <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #0b4da2; margin: 20px 0; border-radius: 4px;">
        ${otp}
      </div>
      <p style="font-size: 14px; color: #64748b;">Ce code est valable pendant 10 minutes. Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8;">&copy; ${new Date().getFullYear()} Edem-Care. Tous droits réservés.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Votre code de vérification Edem-Care",
    html,
  });
}
