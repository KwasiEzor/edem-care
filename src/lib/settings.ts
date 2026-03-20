import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminSettings {
  // Profil & Cabinet
  business_name: string;
  business_specialty: string;
  business_zone: string;
  business_phone: string;
  business_email: string | null;
  admin_display_name: string | null;

  // Rendez-vous
  booking_max_days_ahead: number;
  booking_allow_sundays: boolean;

  // Chatbot IA
  chatbot_enabled: boolean;
  chatbot_system_prompt: string | null;

  // WhatsApp
  whatsapp_ai_auto_reply: boolean;

  // Notifications
  notify_email_new_booking: boolean;
  notify_email_new_contact: boolean;
  notify_email_booking_reminder: boolean;
  notify_sound_alerts: boolean;

  updated_at: string;
}

export const DEFAULT_SETTINGS: AdminSettings = {
  business_name: "Edem-Care",
  business_specialty: "Soins infirmiers à domicile",
  business_zone: "Bruxelles et alentours",
  business_phone: "+32 XXX XX XX XX",
  business_email: null,
  admin_display_name: null,

  booking_max_days_ahead: 60,
  booking_allow_sundays: false,

  chatbot_enabled: true,
  chatbot_system_prompt: null,

  whatsapp_ai_auto_reply: true,

  notify_email_new_booking: true,
  notify_email_new_contact: true,
  notify_email_booking_reminder: true,
  notify_sound_alerts: false,

  updated_at: new Date().toISOString(),
};

let cache: { data: AdminSettings; expiresAt: number } | null = null;
const CACHE_TTL = 30_000; // 30 seconds

export async function getSettings(): Promise<AdminSettings> {
  if (cache && Date.now() < cache.expiresAt) {
    return cache.data;
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("admin_settings")
      .select("*")
      .eq("id", "default")
      .single();

    if (error || !data) {
      console.error("Failed to fetch settings:", error);
      return DEFAULT_SETTINGS;
    }

    const settings: AdminSettings = { ...DEFAULT_SETTINGS, ...data };
    cache = { data: settings, expiresAt: Date.now() + CACHE_TTL };
    return settings;
  } catch (err) {
    console.error("Settings fetch error:", err);
    return DEFAULT_SETTINGS;
  }
}

export function invalidateSettingsCache() {
  cache = null;
}
