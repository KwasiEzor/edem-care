import { createClient } from "@/lib/supabase/server";
import { invalidateSettingsCache } from "@/lib/settings";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const settingsUpdateSchema = z.object({
  business_name: z.string().min(1).max(200).optional(),
  business_specialty: z.string().min(1).max(200).optional(),
  business_zone: z.string().min(1).max(200).optional(),
  business_phone: z.string().min(1).max(30).optional(),
  business_email: z.string().email().nullable().optional(),
  admin_display_name: z.string().max(100).nullable().optional(),

  booking_max_days_ahead: z.number().int().min(7).max(180).optional(),
  booking_allow_sundays: z.boolean().optional(),

  chatbot_enabled: z.boolean().optional(),
  chatbot_system_prompt: z.string().max(5000).nullable().optional(),

  whatsapp_ai_auto_reply: z.boolean().optional(),
  whatsapp_welcome_message: z.string().min(1).max(1000).optional(),
  whatsapp_away_message: z.string().min(1).max(1000).optional(),
  whatsapp_business_hours_enabled: z.boolean().optional(),
  whatsapp_business_hours: z
    .record(
      z.string(),
      z.object({
        enabled: z.boolean(),
        start: z.string().regex(/^\d{2}:\d{2}$/),
        end: z.string().regex(/^\d{2}:\d{2}$/),
      })
    )
    .optional(),
  whatsapp_max_ai_messages: z.number().int().min(1).max(50).optional(),
  whatsapp_escalation_keywords: z.array(z.string().max(50)).max(20).optional(),
  whatsapp_quick_replies: z
    .array(
      z.object({
        label: z.string().min(1).max(50),
        message: z.string().min(1).max(1000),
      })
    )
    .max(20)
    .optional(),

  notify_email_new_booking: z.boolean().optional(),
  notify_email_new_contact: z.boolean().optional(),
  notify_email_booking_reminder: z.boolean().optional(),
  notify_sound_alerts: z.boolean().optional(),

  patient_notify_email: z.boolean().optional(),
  patient_notify_whatsapp: z.boolean().optional(),
});

async function ensureAuth() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }
  return supabase;
}

export async function GET() {
  const supabase = await ensureAuth();
  if (!supabase) {
    return NextResponse.json(
      { error: "Authentification requise" },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("admin_settings")
    .select("*")
    .eq("id", "default")
    .single();

  if (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { error: "Impossible de charger les paramètres" },
      { status: 500 }
    );
  }

  return NextResponse.json({ settings: data });
}

export async function PUT(request: NextRequest) {
  const supabase = await ensureAuth();
  if (!supabase) {
    return NextResponse.json(
      { error: "Authentification requise" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const parsed = settingsUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.message },
      { status: 400 }
    );
  }

  const updates = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("admin_settings")
    .update(updates)
    .eq("id", "default")
    .select()
    .single();

  if (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Impossible de sauvegarder les paramètres" },
      { status: 500 }
    );
  }

  invalidateSettingsCache();

  return NextResponse.json({ settings: data });
}
