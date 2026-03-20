import { bookingCancelSchema, bookingUpdateSchema } from "@/lib/validations";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const AVAILABLE_SLOTS_RPC = "get_available_slots";

/** Normalize "HH:MM:SS" or "HH:MM" → "HH:MM" for comparison */
function toHHMM(t: string) {
  return t.slice(0, 5);
}

async function ensureSession() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Authentification requise" },
      { status: 401 }
    );
  }

  return { supabase, userEmail: session.user.email };
}

export async function GET() {
  const sessionResult = await ensureSession();
  if ("status" in sessionResult) {
    return sessionResult;
  }

  const { supabase, userEmail } = sessionResult;
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id,date,time_slot_start,time_slot_end,care_type,patient_notes,status,patient_name,patient_phone"
    )
    .eq("patient_email", userEmail)
    .order("date", { ascending: false });

  if (error) {
    console.error("Patient bookings fetch error:", error);
    return NextResponse.json(
      { error: "Impossible de récupérer vos rendez-vous" },
      { status: 500 }
    );
  }

  return NextResponse.json({ bookings: data ?? [] });
}

export async function PATCH(request: NextRequest) {
  const sessionResult = await ensureSession();
  if ("status" in sessionResult) {
    return sessionResult;
  }

  const { supabase, userEmail } = sessionResult;
  const body = await request.json();
  const parsed = bookingUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.message },
      { status: 400 }
    );
  }

  const {
    booking_id,
    date,
    time_slot_start,
    time_slot_end,
    patient_notes,
    care_type,
  } = parsed.data;

  const { data: booking } = await supabase
    .from("bookings")
    .select("id,date,time_slot_start,time_slot_end,patient_email")
    .eq("id", booking_id)
    .single();

  if (!booking || booking.patient_email !== userEmail) {
    return NextResponse.json(
      { error: "Rendez-vous introuvable ou accès refusé" },
      { status: 403 }
    );
  }

  const updates: Record<string, unknown> = {};
  if (date) updates.date = date;
  if (care_type) updates.care_type = care_type;
  if (patient_notes !== undefined) {
    updates.patient_notes = patient_notes;
  }

  const wantsSlotUpdate = Boolean(date && time_slot_start && time_slot_end);

  if ((time_slot_start || time_slot_end) && !wantsSlotUpdate) {
    return NextResponse.json(
      { error: "Indiquez la nouvelle date ET le créneau complet" },
      { status: 400 }
    );
  }

  if (wantsSlotUpdate) {
    const isSameSlot =
      booking.date === date &&
      toHHMM(booking.time_slot_start) === toHHMM(time_slot_start!) &&
      toHHMM(booking.time_slot_end) === toHHMM(time_slot_end!);

    if (!isSameSlot) {
      const { data: slots, error: slotsError } = await supabase.rpc(
        AVAILABLE_SLOTS_RPC,
        {
          target_date: date,
        }
      );

      if (slotsError) {
        console.error("Slots RPC error:", slotsError);
        return NextResponse.json(
          { error: "Impossible de vérifier les créneaux" },
          { status: 500 }
        );
      }

      const slotIsAvailable = (slots ?? []).some(
        (slot: { start_time: string }) =>
          toHHMM(slot.start_time) === toHHMM(time_slot_start!)
      );

      if (!slotIsAvailable) {
        return NextResponse.json(
          { error: "Ce créneau n'est plus disponible" },
          { status: 409 }
        );
      }
    }

    updates.time_slot_start = time_slot_start;
    updates.time_slot_end = time_slot_end;
  }

  if (date) updates.date = date;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "Aucune donnée à mettre à jour" },
      { status: 400 }
    );
  }

  const { data: updated, error } = await supabase
    .from("bookings")
    .update(updates)
    .eq("id", booking_id)
    .select()
    .single();

  if (error) {
    console.error("Booking update error:", error);
    return NextResponse.json(
      { error: "Impossible de mettre à jour le rendez-vous" },
      { status: 500 }
    );
  }

  return NextResponse.json({ booking: updated });
}

export async function DELETE(request: NextRequest) {
  const sessionResult = await ensureSession();
  if ("status" in sessionResult) {
    return sessionResult;
  }

  const { supabase, userEmail } = sessionResult;
  const body = await request.json();
  const parsed = bookingCancelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.message },
      { status: 400 }
    );
  }

  const { booking_id } = parsed.data;
  const { data: booking } = await supabase
    .from("bookings")
    .select("id,status,patient_email")
    .eq("id", booking_id)
    .single();

  if (!booking || booking.patient_email !== userEmail) {
    return NextResponse.json(
      { error: "Rendez-vous introuvable ou accès refusé" },
      { status: 403 }
    );
  }

  if (booking.status === "cancelled") {
    return NextResponse.json({ success: true });
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", booking_id);

  if (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { error: "Impossible d'annuler le rendez-vous" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
