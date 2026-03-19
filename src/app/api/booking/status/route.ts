import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const { bookingId, status, notes } = await request.json();

  if (!bookingId || !status) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Send email to patient
  if (status === "confirmed") {
    try {
      await resend.emails.send({
        from: "Edem-Care <notifications@edem-care.be>",
        to: booking.patient_email,
        subject: "Votre rendez-vous est confirmé - Edem-Care",
        html: `
          <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; background: #f7f3ee; padding: 32px;">
            <div style="background: #2d5a4a; padding: 24px; border-radius: 12px 12px 0 0;">
              <h1 style="color: #ffffff; font-family: 'Garamond', serif; margin: 0; font-size: 24px;">Edem-Care</h1>
            </div>
            <div style="background: #ffffff; padding: 24px; border-radius: 0 0 12px 12px;">
              <h2 style="color: #1a2e2a; margin-top: 0;">Rendez-vous confirmé</h2>
              <p style="color: #6b7b76;">Bonjour ${booking.patient_name},</p>
              <p style="color: #6b7b76;">Votre rendez-vous a été confirmé.</p>
              <div style="background: #2d5a4a10; border-left: 4px solid #2d5a4a; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0;">
                <p style="margin: 4px 0; color: #1a2e2a;"><strong>Date :</strong> ${booking.date}</p>
                <p style="margin: 4px 0; color: #1a2e2a;"><strong>Heure :</strong> ${booking.time_slot_start.slice(0, 5)} - ${booking.time_slot_end.slice(0, 5)}</p>
              </div>
              ${notes ? `<p style="color: #6b7b76;"><em>Note : ${notes}</em></p>` : ""}
              <p style="color: #6b7b76;">En cas d'empêchement, merci de nous prévenir le plus tôt possible.</p>
              <p style="color: #6b7b76;">À bientôt,<br/>Edem-Care</p>
            </div>
          </div>
        `,
      });
    } catch (e) {
      console.error("Email error:", e);
    }
  } else if (status === "cancelled") {
    try {
      await resend.emails.send({
        from: "Edem-Care <notifications@edem-care.be>",
        to: booking.patient_email,
        subject: "Rendez-vous annulé - Edem-Care",
        html: `
          <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; background: #f7f3ee; padding: 32px;">
            <div style="background: #2d5a4a; padding: 24px; border-radius: 12px 12px 0 0;">
              <h1 style="color: #ffffff; font-family: 'Garamond', serif; margin: 0; font-size: 24px;">Edem-Care</h1>
            </div>
            <div style="background: #ffffff; padding: 24px; border-radius: 0 0 12px 12px;">
              <h2 style="color: #1a2e2a; margin-top: 0;">Rendez-vous annulé</h2>
              <p style="color: #6b7b76;">Bonjour ${booking.patient_name},</p>
              <p style="color: #6b7b76;">Nous sommes désolés, votre rendez-vous du ${booking.date} à ${booking.time_slot_start.slice(0, 5)} a été annulé.</p>
              ${notes ? `<p style="color: #6b7b76;"><strong>Raison :</strong> ${notes}</p>` : ""}
              <p style="color: #6b7b76;">N'hésitez pas à prendre un nouveau rendez-vous sur notre site.</p>
              <p style="color: #6b7b76;">Cordialement,<br/>Edem-Care</p>
            </div>
          </div>
        `,
      });
    } catch (e) {
      console.error("Email error:", e);
    }
  }

  return NextResponse.json({ success: true });
}
