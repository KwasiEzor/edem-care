import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
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

    // Update the booking status
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status,
        admin_notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError) {
      console.error("DB Update error:", updateError);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour" },
        { status: 500 }
      );
    }

    // Audit Log
    await logAudit({
      adminId: user.id,
      action: status === "confirmed" ? "CONFIRM_BOOKING" : "CANCEL_BOOKING",
      entityType: "bookings",
      entityId: bookingId,
      oldData: { status: booking.status },
      newData: { status, notes },
    });

    // Patient notification (email + WhatsApp based on settings)
    try {
      const { notifyPatient } = await import(
        "@/lib/notifications/patient-notifications"
      );
      await notifyPatient({
        event: status === "confirmed" ? "booking_confirmed" : "booking_cancelled",
        booking,
        adminNotes: notes,
      });
    } catch (e) {
      console.error("Patient notification error:", e);
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
