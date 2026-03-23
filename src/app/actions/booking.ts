"use server";

import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { bookingFormSchema, type BookingFormData } from "@/lib/validations";
import { getSettings } from "@/lib/settings";
import { validateBotProtection } from "@/lib/turnstile";
import { env } from "@/lib/env";
import type { Booking } from "@/types/database";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";

const CREATE_BOOKING_RPC = "create_booking_atomic";
const AVAILABLE_SLOTS_RPC = "get_available_slots";

type CreateBookingPayload = Pick<
  BookingFormData,
  | "patient_name"
  | "patient_email"
  | "patient_phone"
  | "care_type"
  | "date"
  | "time_slot_start"
  | "time_slot_end"
  | "patient_notes"
>;

class BookingCreationError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly details?: string | null
  ) {
    super(message);
    this.name = "BookingCreationError";
  }
}

function toHHMM(value: string) {
  return value.slice(0, 5);
}

function isMissingCreateBookingRpc(error: any) {
  if (!error) return false;
  return (
    error.code === "PGRST202" ||
    error.message.includes("Could not find the function")
  );
}

function splitPatientName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstName: "", lastName: fullName.trim() };
  }
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" ") || fullName.trim(),
  };
}

async function createBookingWithoutRpc(
  supabase: ReturnType<typeof createAdminClient>,
  payload: CreateBookingPayload
) {
  const { data: slots, error: slotsError } = await supabase.rpc(
    AVAILABLE_SLOTS_RPC,
    { target_date: payload.date }
  );

  if (slotsError) {
    throw new BookingCreationError(
      "Impossible de vérifier les créneaux",
      500,
      slotsError.code,
      slotsError.message
    );
  }

  const slotIsAvailable = (slots ?? []).some(
    (slot: any) => toHHMM(slot.start_time) === toHHMM(payload.time_slot_start)
  );

  if (!slotIsAvailable) {
    throw new BookingCreationError("Ce créneau n'est plus disponible", 409);
  }

  const { data: patientByPhone, error: patientByPhoneError } = await supabase
    .from("patients")
    .select("id")
    .eq("phone", payload.patient_phone)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (patientByPhoneError) {
    throw new BookingCreationError(
      "Impossible de retrouver le patient",
      500,
      patientByPhoneError.code,
      patientByPhoneError.message
    );
  }

  let patientId = patientByPhone?.id ?? null;

  if (!patientId) {
    const { data: patientByEmail, error: patientByEmailError } = await supabase
      .from("patients")
      .select("id")
      .eq("email", payload.patient_email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (patientByEmailError) {
      throw new BookingCreationError(
        "Impossible de retrouver le patient",
        500,
        patientByEmailError.code,
        patientByEmailError.message
      );
    }
    patientId = patientByEmail?.id ?? null;
  }

  if (!patientId) {
    const { firstName, lastName } = splitPatientName(payload.patient_name);
    const { data: createdPatient, error: patientInsertError } = await supabase
      .from("patients")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: payload.patient_email,
        phone: payload.patient_phone,
      })
      .select("id")
      .single();

    if (patientInsertError) {
      throw new BookingCreationError(
        "Impossible de créer le patient",
        500,
        patientInsertError.code,
        patientInsertError.message
      );
    }
    patientId = createdPatient.id;
  }

  const { data: booking, error: bookingInsertError } = await supabase
    .from("bookings")
    .insert({
      patient_id: patientId,
      patient_name: payload.patient_name,
      patient_email: payload.patient_email,
      patient_phone: payload.patient_phone,
      care_type: payload.care_type,
      date: payload.date,
      time_slot_start: payload.time_slot_start,
      time_slot_end: payload.time_slot_end,
      patient_notes: payload.patient_notes || null,
      status: "pending",
    })
    .select()
    .single();

  if (bookingInsertError) {
    throw new BookingCreationError(
      "Erreur lors de la création du rendez-vous",
      500,
      bookingInsertError.code,
      bookingInsertError.message
    );
  }

  return booking as Booking;
}

async function createBooking(
  supabase: ReturnType<typeof createAdminClient>,
  payload: CreateBookingPayload
) {
  const { data: booking, error: dbError } = await supabase.rpc(
    CREATE_BOOKING_RPC,
    {
      p_patient_name: String(payload.patient_name),
      p_patient_email: String(payload.patient_email),
      p_patient_phone: String(payload.patient_phone),
      p_care_type: String(payload.care_type),
      p_date: String(payload.date),
      p_time_slot_start: String(payload.time_slot_start),
      p_time_slot_end: String(payload.time_slot_end),
      p_patient_notes: payload.patient_notes ? String(payload.patient_notes) : null,
    }
  );

  if (!dbError) return booking as Booking;

  if (dbError.code === "P0001") {
    throw new BookingCreationError("Ce créneau n'est plus disponible", 409);
  }

  if (!isMissingCreateBookingRpc(dbError)) {
    throw new BookingCreationError(
      "Erreur lors de la création du rendez-vous",
      500,
      dbError.code,
      dbError.message
    );
  }

  return createBookingWithoutRpc(supabase, payload);
}

export async function createBookingAction(formData: BookingFormData) {
  try {
    const parsed = bookingFormSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: "Données invalides", details: parsed.error.format() };
    }

    // Bot protection
    const isBotValid = await validateBotProtection({
      token: parsed.data.turnstile_token,
      honeypot: parsed.data.honeypot,
      mathAnswer: parsed.data.math_answer,
      mathToken: parsed.data.math_token,
    });
    
    if (!isBotValid) {
      return { success: false, error: "Validation anti-robot échouée. Veuillez vérifier les champs." };
    }

    const settings = await getSettings();

    // Rate limit
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { allowed } = rateLimit(ip, "booking-action", 5, 60 * 60 * 1000);
    if (!allowed) {
      return { success: false, error: "Trop de demandes. Réessayez plus tard." };
    }

    // Server-side date validation
    const { getBrusselsDate, compareWithBrusselsToday } = await import("@/lib/utils");
    const todayStr = getBrusselsDate();
    const comparison = compareWithBrusselsToday(parsed.data.date);

    if (comparison === -1) {
      return { success: false, error: "La date ne peut pas être dans le passé" };
    }

    // Max days ahead
    const maxDate = new Date(todayStr);
    maxDate.setDate(maxDate.getDate() + settings.booking_max_days_ahead);
    const maxDateStr = maxDate.toLocaleDateString("en-CA", { timeZone: "Europe/Brussels" });
    
    if (parsed.data.date > maxDateStr) {
      return { success: false, error: `La date ne peut pas dépasser ${settings.booking_max_days_ahead} jours` };
    }

    const bookingDateObj = new Date(parsed.data.date + "T00:00:00");
    if (!settings.booking_allow_sundays && bookingDateObj.getDay() === 0) {
      return { success: false, error: "Les rendez-vous ne sont pas disponibles le dimanche" };
    }

    const supabase = createAdminClient();
    let booking: Booking;

    try {
      booking = await createBooking(supabase, parsed.data);
    } catch (error: any) {
      return { success: false, error: error.message || "Erreur lors de la création du rendez-vous" };
    }

    // Revalidate relevant data
    revalidatePath("/admin/rendez-vous");

    // Notifications (Fire and forget, we don't want to block the user)
    (async () => {
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
              timeSlot: `${parsed.data.time_slot_start.slice(0, 5)} - ${parsed.data.time_slot_end.slice(0, 5)}`,
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
        
        const { notifyPatient } = await import("@/lib/notifications/patient-notifications");
        await notifyPatient({ event: "booking_created", booking });
      } catch (e) {
        console.error("Post-booking notifications error:", e);
      }
    })();

    return { success: true, booking };
  } catch (error) {
    console.error("Booking action error:", error);
    return { success: false, error: "Une erreur inattendue s'est produite" };
  }
}
