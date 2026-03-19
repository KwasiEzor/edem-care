import { createAdminClient } from "@/lib/supabase/admin";
import { bookingFormSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const body = await request.json();

  const parsed = bookingFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
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
    await resend.emails.send({
      from: "Edem-Care <notifications@edem-care.be>",
      to: process.env.ADMIN_EMAIL!,
      subject: `Nouvelle demande de RDV - ${parsed.data.patient_name}`,
      html: `
        <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; background: #f7f3ee; padding: 32px;">
          <div style="background: #2d5a4a; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #ffffff; font-family: 'Garamond', serif; margin: 0; font-size: 24px;">
              Edem-Care
            </h1>
          </div>
          <div style="background: #ffffff; padding: 24px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1a2e2a; margin-top: 0;">Nouvelle demande de rendez-vous</h2>
            <div style="background: #c9a96e20; border-left: 4px solid #c9a96e; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
              <p style="margin: 0; color: #1a2e2a; font-weight: 600;">En attente de confirmation</p>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7b76; width: 120px;">Patient</td>
                <td style="padding: 8px 0; color: #1a2e2a; font-weight: 500;">${parsed.data.patient_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7b76;">Email</td>
                <td style="padding: 8px 0; color: #1a2e2a;">${parsed.data.patient_email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7b76;">Téléphone</td>
                <td style="padding: 8px 0; color: #1a2e2a;">${parsed.data.patient_phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7b76;">Date</td>
                <td style="padding: 8px 0; color: #1a2e2a; font-weight: 500;">${parsed.data.date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7b76;">Créneau</td>
                <td style="padding: 8px 0; color: #1a2e2a;">${parsed.data.time_slot_start} - ${parsed.data.time_slot_end}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7b76;">Type de soins</td>
                <td style="padding: 8px 0; color: #1a2e2a;">${parsed.data.care_type}</td>
              </tr>
            </table>
            ${parsed.data.patient_notes ? `
            <div style="margin-top: 16px; padding: 16px; background: #f7f3ee; border-radius: 8px;">
              <p style="color: #6b7b76; margin: 0 0 8px; font-size: 14px;">Notes du patient :</p>
              <p style="color: #1a2e2a; margin: 0;">${parsed.data.patient_notes}</p>
            </div>` : ""}
            <p style="margin-top: 24px; color: #6b7b76; font-size: 12px;">
              Connectez-vous au panel admin pour confirmer ou annuler ce rendez-vous.
            </p>
          </div>
        </div>
      `,
    });
  } catch (emailError) {
    console.error("Email error:", emailError);
  }

  return NextResponse.json({ success: true, booking });
}
