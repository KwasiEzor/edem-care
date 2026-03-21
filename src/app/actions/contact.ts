"use server";

import { contactFormSchema, type ContactFormData } from "@/lib/validations";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { getSettings } from "@/lib/settings";
import { rateLimit } from "@/lib/rate-limit";
import { validateBotProtection } from "@/lib/turnstile";
import { headers } from "next/headers";

export async function submitContact(data: ContactFormData) {
  try {
    // Bot protection
    const isBotValid = await validateBotProtection({
      token: data.turnstile_token,
      honeypot: data.honeypot,
      mathAnswer: data.math_answer,
    });
    
    if (!isBotValid) {
      return { success: false, error: "Validation anti-robot échouée. Veuillez remplir le défi mathématique si Turnstile ne s'affiche pas." };
    }

    // Rate limit by IP
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { allowed } = rateLimit(ip, "contact", 10, 60 * 60 * 1000);
    if (!allowed) {
      return { success: false, error: "Trop de demandes. Réessayez plus tard." };
    }

    // Validate
    const parsed = contactFormSchema.safeParse({
      ...data,
      honeypot: data.honeypot ?? "",
    });
    if (!parsed.success) {
      console.error("Contact validation error:", parsed.error.format());
      return { success: false, error: "Données invalides", details: parsed.error.format() };
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
    const settings = await getSettings();
    try {
      if (settings.notify_email_new_contact && env.RESEND_API_KEY) {
        const { Resend } = await import("resend");
        const { render } = await import("@react-email/components");
        const { ContactSubmissionAdminEmail } = await import(
          "@/emails/contact-submission-admin"
        );

        const resend = new Resend(env.RESEND_API_KEY);

        const emailHtml = await render(
          ContactSubmissionAdminEmail({
            name: parsed.data.name,
            email: parsed.data.email,
            phone: parsed.data.phone,
            careType: parsed.data.care_type,
            message: parsed.data.message,
          })
        );

        await resend.emails.send({
          from: "Edem-Care <notifications@edem-care.be>",
          to: env.ADMIN_EMAIL!,
          subject: `Nouveau message de ${parsed.data.name}`,
          html: emailHtml,
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
