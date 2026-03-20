import { createAdminClient } from "@/lib/supabase/admin";
import { bookingFormSchema } from "@/lib/validations";
import { escapeHtml } from "@/lib/utils";
import { getSettings } from "@/lib/settings";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const settings = await getSettings();

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const { allowed } = rateLimit(ip, "booking", 5, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Trop de demandes. Réessayez plus tard." },
        { status: 429 }
      );
    }

    const body = await request.json();

    const parsed = bookingFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      );
    }

    // Server-side date validation
    const bookingDate = new Date(parsed.data.date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(bookingDate.getTime())) {
      return NextResponse.json(
        { error: "Date invalide" },
        { status: 400 }
      );
    }

    if (bookingDate < today) {
      return NextResponse.json(
        { error: "La date ne peut pas être dans le passé" },
        { status: 400 }
      );
    }

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + settings.booking_max_days_ahead);
    if (bookingDate > maxDate) {
      return NextResponse.json(
        { error: `La date ne peut pas dépasser ${settings.booking_max_days_ahead} jours` },
        { status: 400 }
      );
    }

    if (!settings.booking_allow_sundays && bookingDate.getDay() === 0) {
      return NextResponse.json(
        { error: "Les rendez-vous ne sont pas disponibles le dimanche" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check slot is still available
    const { data: slots } = await supabase.rpc("get_available_slots", {
      target_date: parsed.data.date,
    });

    const isAvailable = slots?.some(
      (slot: { start_time: string }) =>
        slot.start_time === parsed.data.time_slot_start
    );

    if (!isAvailable) {
      return NextResponse.json(
        { error: "Ce créneau n'est plus disponible" },
        { status: 409 }
      );
    }

    // Insert booking
    const { data: booking, error: dbError } = await supabase
      .from("bookings")
      .insert({
        patient_name: parsed.data.patient_name,
        patient_email: parsed.data.patient_email,
        patient_phone: parsed.data.patient_phone,
        care_type: parsed.data.care_type,
        date: parsed.data.date,
        time_slot_start: parsed.data.time_slot_start,
        time_slot_end: parsed.data.time_slot_end,
        patient_notes: parsed.data.patient_notes || null,
        status: "pending",
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB error:", dbError);
      return NextResponse.json(
        { error: "Erreur lors de la création du rendez-vous" },
        { status: 500 }
      );
    }

    // Send admin notification
    try {
      if (settings.notify_email_new_booking && process.env.RESEND_API_KEY) {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        const patientName = escapeHtml(parsed.data.patient_name);
        const patientEmail = escapeHtml(parsed.data.patient_email);
        const patientPhone = escapeHtml(parsed.data.patient_phone);
        const careType = escapeHtml(parsed.data.care_type);
        const date = escapeHtml(parsed.data.date);
        const timeStart = escapeHtml(parsed.data.time_slot_start);
        const timeEnd = escapeHtml(parsed.data.time_slot_end);
        const patientNotes = parsed.data.patient_notes
          ? escapeHtml(parsed.data.patient_notes)
          : null;

        await resend.emails.send({
          from: "Edem-Care <notifications@edem-care.be>",
          to: process.env.ADMIN_EMAIL!,
          subject: `Nouvelle demande de RDV - ${patientName}`,
          html: `
            <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; background: #F8FAFC; padding: 32px;">
              <div style="background: #0B4DA2; padding: 24px; border-radius: 12px 12px 0 0;">
                <h1 style="color: #ffffff; font-family: 'Garamond', serif; margin: 0; font-size: 24px;">
                  Edem-Care
                </h1>
              </div>
              <div style="background: #ffffff; padding: 24px; border-radius: 0 0 12px 12px;">
                <h2 style="color: #0F172A; margin-top: 0;">Nouvelle demande de rendez-vous</h2>
                <div style="background: #0B4DA210; border-left: 4px solid #F59E0B; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
                  <p style="margin: 0; color: #0F172A; font-weight: 600;">En attente de confirmation</p>
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748B; width: 120px;">Patient</td>
                    <td style="padding: 8px 0; color: #0F172A; font-weight: 500;">${patientName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748B;">Email</td>
                    <td style="padding: 8px 0; color: #0F172A;">${patientEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748B;">Téléphone</td>
                    <td style="padding: 8px 0; color: #0F172A;">${patientPhone}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748B;">Date</td>
                    <td style="padding: 8px 0; color: #0F172A; font-weight: 500;">${date}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748B;">Créneau</td>
                    <td style="padding: 8px 0; color: #0F172A;">${timeStart} - ${timeEnd}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748B;">Type de soins</td>
                    <td style="padding: 8px 0; color: #0F172A;">${careType}</td>
                  </tr>
                </table>
                ${patientNotes ? `
                <div style="margin-top: 16px; padding: 16px; background: #F8FAFC; border-radius: 8px;">
                  <p style="color: #64748B; margin: 0 0 8px; font-size: 14px;">Notes du patient :</p>
                  <p style="color: #0F172A; margin: 0;">${patientNotes}</p>
                </div>` : ""}
                <p style="margin-top: 24px; color: #64748B; font-size: 12px;">
                  Connectez-vous au panel admin pour confirmer ou annuler ce rendez-vous.
                </p>
              </div>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error("Email error:", emailError);
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Une erreur inattendue s'est produite" },
      { status: 500 }
    );
  }
}
