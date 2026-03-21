import { createAdminClient } from "@/lib/supabase/admin";
import { bookingFormSchema } from "@/lib/validations";
import { escapeHtml } from "@/lib/utils";
import { getSettings } from "@/lib/settings";
import { rateLimit } from "@/lib/rate-limit";
import { validateBotProtection } from "@/lib/turnstile";
import { env } from "@/lib/env";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = bookingFormSchema.safeParse(body);
    if (!parsed.success) {
      console.error("Booking validation error:", parsed.error.format());
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.format() },
        { status: 400 }
      );
    }

    // Bot protection
    const isBotValid = await validateBotProtection({
      token: parsed.data.turnstile_token,
      honeypot: parsed.data.honeypot,
      mathAnswer: parsed.data.math_answer,
    });
    
    if (!isBotValid) {
      return NextResponse.json(
        { error: "Validation anti-robot échouée. Veuillez remplir le défi mathématique si Turnstile ne s'affiche pas." },
        { status: 403 }
      );
    }

    const settings = await getSettings();

    // Rate limit by IP
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

    // Atomic check and insert
    const { data: booking, error: dbError } = await supabase.rpc("create_booking_atomic", {
      p_patient_name: String(parsed.data.patient_name),
      p_patient_email: String(parsed.data.patient_email),
      p_patient_phone: String(parsed.data.patient_phone),
      p_care_type: String(parsed.data.care_type),
      p_date: String(parsed.data.date),
      p_time_slot_start: String(parsed.data.time_slot_start),
      p_time_slot_end: String(parsed.data.time_slot_end),
      p_patient_notes: parsed.data.patient_notes ? String(parsed.data.patient_notes) : null,
    });

    if (dbError) {
      console.error("DB error:", dbError);
      
      if (dbError.code === 'P0001') {
        return NextResponse.json(
          { error: "Ce créneau n'est plus disponible" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { 
          error: "Erreur lors de la création du rendez-vous",
          message: dbError.message,
          code: dbError.code
        },
        { status: 500 }
      );
    }

    // Send admin notification
    try {
      if (settings.notify_email_new_booking && env.RESEND_API_KEY) {
        const { Resend } = await import("resend");
        const { render } = await import("@react-email/components");
        const { NewBookingAdminEmail } = await import("@/emails/new-booking-admin");
        
        const resend = new Resend(env.RESEND_API_KEY);

        const emailHtml = await render(
          NewBookingAdminEmail({
            patientName: parsed.data.patient_name,
            patientEmail: parsed.data.patient_email,
            patientPhone: parsed.data.patient_phone,
            careType: parsed.data.care_type,
            date: parsed.data.date,
            timeStart: parsed.data.time_slot_start,
            timeEnd: parsed.data.time_slot_end,
            patientNotes: parsed.data.patient_notes,
          })
        );

        await resend.emails.send({
          from: "Edem-Care <notifications@edem-care.be>",
          to: env.ADMIN_EMAIL!,
          subject: `Nouvelle demande de RDV - ${parsed.data.patient_name}`,
          html: emailHtml,
        });
      }
    } catch (emailError) {
      console.error("Email error:", emailError);
    }

    // Patient notification
    try {
      const { notifyPatient } = await import(
        "@/lib/notifications/patient-notifications"
      );
      await notifyPatient({ event: "booking_created", booking });
    } catch (e) {
      console.error("Patient notification error:", e);
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
