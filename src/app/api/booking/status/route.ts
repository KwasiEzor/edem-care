import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { escapeHtml } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const statusUpdateSchema = z.object({
  bookingId: z
    .string()
    .uuid("Identifiant de réservation invalide"),
  status: z.enum(["confirmed", "cancelled"], {
    message: "Statut invalide",
  }),
  notes: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate — only admin users can update booking status
    const supabaseAuth = await createClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const parsed = statusUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      );
    }

    const { bookingId, status, notes } = parsed.data;

    const supabase = createAdminClient();

    const { data: booking } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation introuvable" },
        { status: 404 }
      );
    }

    // Send email to patient
    if (status === "confirmed") {
      try {
        if (process.env.RESEND_API_KEY) {
          const { Resend } = await import("resend");
          const resend = new Resend(process.env.RESEND_API_KEY);

          const patientName = escapeHtml(booking.patient_name);
          const escapedNotes = notes ? escapeHtml(notes) : null;

          await resend.emails.send({
            from: "Edem-Care <notifications@edem-care.be>",
            to: booking.patient_email,
            subject: "Votre rendez-vous est confirmé - Edem-Care",
            html: `
              <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; background: #F8FAFC; padding: 32px;">
                <div style="background: #0B4DA2; padding: 24px; border-radius: 12px 12px 0 0;">
                  <h1 style="color: #ffffff; font-family: 'Garamond', serif; margin: 0; font-size: 24px;">Edem-Care</h1>
                </div>
                <div style="background: #ffffff; padding: 24px; border-radius: 0 0 12px 12px;">
                  <h2 style="color: #0F172A; margin-top: 0;">Rendez-vous confirmé</h2>
                  <p style="color: #64748B;">Bonjour ${patientName},</p>
                  <p style="color: #64748B;">Votre rendez-vous a été confirmé.</p>
                  <div style="background: #0B4DA210; border-left: 4px solid #0B4DA2; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0;">
                    <p style="margin: 4px 0; color: #0F172A;"><strong>Date :</strong> ${booking.date}</p>
                    <p style="margin: 4px 0; color: #0F172A;"><strong>Heure :</strong> ${booking.time_slot_start.slice(0, 5)} - ${booking.time_slot_end.slice(0, 5)}</p>
                  </div>
                  ${escapedNotes ? `<p style="color: #64748B;"><em>Note : ${escapedNotes}</em></p>` : ""}
                  <p style="color: #64748B;">En cas d'empêchement, merci de nous prévenir le plus tôt possible.</p>
                  <p style="color: #64748B;">À bientôt,<br/>Edem-Care</p>
                </div>
              </div>
            `,
          });
        }
      } catch (e) {
        console.error("Email error:", e);
      }
    } else if (status === "cancelled") {
      try {
        if (process.env.RESEND_API_KEY) {
          const { Resend } = await import("resend");
          const resend = new Resend(process.env.RESEND_API_KEY);

          const patientName = escapeHtml(booking.patient_name);
          const escapedNotes = notes ? escapeHtml(notes) : null;

          await resend.emails.send({
            from: "Edem-Care <notifications@edem-care.be>",
            to: booking.patient_email,
            subject: "Rendez-vous annulé - Edem-Care",
            html: `
              <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; background: #F8FAFC; padding: 32px;">
                <div style="background: #0B4DA2; padding: 24px; border-radius: 12px 12px 0 0;">
                  <h1 style="color: #ffffff; font-family: 'Garamond', serif; margin: 0; font-size: 24px;">Edem-Care</h1>
                </div>
                <div style="background: #ffffff; padding: 24px; border-radius: 0 0 12px 12px;">
                  <h2 style="color: #0F172A; margin-top: 0;">Rendez-vous annulé</h2>
                  <p style="color: #64748B;">Bonjour ${patientName},</p>
                  <p style="color: #64748B;">Nous sommes désolés, votre rendez-vous du ${booking.date} à ${booking.time_slot_start.slice(0, 5)} a été annulé.</p>
                  ${escapedNotes ? `<p style="color: #64748B;"><strong>Raison :</strong> ${escapedNotes}</p>` : ""}
                  <p style="color: #64748B;">N'hésitez pas à prendre un nouveau rendez-vous sur notre site.</p>
                  <p style="color: #64748B;">Cordialement,<br/>Edem-Care</p>
                </div>
              </div>
            `,
          });
        }
      } catch (e) {
        console.error("Email error:", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Booking status update error:", error);
    return NextResponse.json(
      { error: "Une erreur inattendue s'est produite" },
      { status: 500 }
    );
  }
}
