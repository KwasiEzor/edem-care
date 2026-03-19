"use server";

import { contactFormSchema, type ContactFormData } from "@/lib/validations";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitContact(data: ContactFormData) {
  // Validate
  const parsed = contactFormSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Données invalides" };
  }

  // Check honeypot
  if (parsed.data.honeypot) {
    // Silently accept to not tip off bots
    return { success: true };
  }

  const supabase = createAdminClient();

  // Save to database
  const { error: dbError } = await supabase
    .from("contact_submissions")
    .insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      care_type: parsed.data.care_type || null,
      message: parsed.data.message,
    });

  if (dbError) {
    console.error("DB error:", dbError);
    return { success: false, error: "Erreur lors de l'enregistrement" };
  }

  // Send admin notification email
  try {
    await resend.emails.send({
      from: "Edem-Care <notifications@edem-care.be>",
      to: process.env.ADMIN_EMAIL!,
      subject: `Nouveau message de ${parsed.data.name}`,
      html: `
        <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; background: #f7f3ee; padding: 32px;">
          <div style="background: #2d5a4a; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #ffffff; font-family: 'Garamond', serif; margin: 0; font-size: 24px;">
              Edem-Care
            </h1>
          </div>
          <div style="background: #ffffff; padding: 24px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1a2e2a; margin-top: 0;">Nouveau message de contact</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7b76; width: 120px;">Nom</td>
                <td style="padding: 8px 0; color: #1a2e2a; font-weight: 500;">${parsed.data.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7b76;">Email</td>
                <td style="padding: 8px 0; color: #1a2e2a;">${parsed.data.email}</td>
              </tr>
              ${parsed.data.phone ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7b76;">Téléphone</td>
                <td style="padding: 8px 0; color: #1a2e2a;">${parsed.data.phone}</td>
              </tr>` : ""}
              ${parsed.data.care_type ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7b76;">Type de soins</td>
                <td style="padding: 8px 0; color: #1a2e2a;">${parsed.data.care_type}</td>
              </tr>` : ""}
            </table>
            <div style="margin-top: 16px; padding: 16px; background: #f7f3ee; border-radius: 8px;">
              <p style="color: #6b7b76; margin: 0 0 8px; font-size: 14px;">Message :</p>
              <p style="color: #1a2e2a; margin: 0; white-space: pre-wrap;">${parsed.data.message}</p>
            </div>
            <p style="margin-top: 24px; color: #6b7b76; font-size: 12px;">
              Reçu via le formulaire de contact sur edem-care.be
            </p>
          </div>
        </div>
      `,
    });
  } catch (emailError) {
    console.error("Email error:", emailError);
    // Don't fail the submission if email fails
  }

  return { success: true };
}
