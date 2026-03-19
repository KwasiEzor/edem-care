"use server";

import { contactFormSchema, type ContactFormData } from "@/lib/validations";
import { createAdminClient } from "@/lib/supabase/admin";
import { escapeHtml } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function submitContact(data: ContactFormData) {
  try {
    // Rate limit by IP
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { allowed } = rateLimit(ip, "contact", 10, 60 * 60 * 1000);
    if (!allowed) {
      return { success: false, error: "Trop de demandes. Réessayez plus tard." };
    }

    // Check honeypot before parsing — if filled, silently accept
    if (data.honeypot) {
      return { success: true };
    }

    // Validate
    const parsed = contactFormSchema.safeParse({
      ...data,
      honeypot: data.honeypot ?? "",
    });
    if (!parsed.success) {
      return { success: false, error: "Données invalides" };
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
      if (process.env.RESEND_API_KEY) {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        const name = escapeHtml(parsed.data.name);
        const email = escapeHtml(parsed.data.email);
        const phone = parsed.data.phone
          ? escapeHtml(parsed.data.phone)
          : null;
        const careType = parsed.data.care_type
          ? escapeHtml(parsed.data.care_type)
          : null;
        const message = escapeHtml(parsed.data.message);

        await resend.emails.send({
          from: "Edem-Care <notifications@edem-care.be>",
          to: process.env.ADMIN_EMAIL!,
          subject: `Nouveau message de ${name}`,
          html: `
            <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; background: #F8FAFC; padding: 32px;">
              <div style="background: #0B4DA2; padding: 24px; border-radius: 12px 12px 0 0;">
                <h1 style="color: #ffffff; font-family: 'Garamond', serif; margin: 0; font-size: 24px;">
                  Edem-Care
                </h1>
              </div>
              <div style="background: #ffffff; padding: 24px; border-radius: 0 0 12px 12px;">
                <h2 style="color: #0F172A; margin-top: 0;">Nouveau message de contact</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748B; width: 120px;">Nom</td>
                    <td style="padding: 8px 0; color: #0F172A; font-weight: 500;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748B;">Email</td>
                    <td style="padding: 8px 0; color: #0F172A;">${email}</td>
                  </tr>
                  ${phone ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748B;">Téléphone</td>
                    <td style="padding: 8px 0; color: #0F172A;">${phone}</td>
                  </tr>` : ""}
                  ${careType ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748B;">Type de soins</td>
                    <td style="padding: 8px 0; color: #0F172A;">${careType}</td>
                  </tr>` : ""}
                </table>
                <div style="margin-top: 16px; padding: 16px; background: #F8FAFC; border-radius: 8px;">
                  <p style="color: #64748B; margin: 0 0 8px; font-size: 14px;">Message :</p>
                  <p style="color: #0F172A; margin: 0; white-space: pre-wrap;">${message}</p>
                </div>
                <p style="margin-top: 24px; color: #64748B; font-size: 12px;">
                  Reçu via le formulaire de contact sur edem-care.be
                </p>
              </div>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error("Email error:", emailError);
      // Don't fail the submission if email fails
    }

    return { success: true };
  } catch (error) {
    console.error("Contact submission error:", error);
    return { success: false, error: "Une erreur inattendue s'est produite" };
  }
}
