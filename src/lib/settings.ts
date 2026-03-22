import { createAdminClient } from "@/lib/supabase/admin";

export interface DayHours {
  enabled: boolean;
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
}

export type BusinessHoursSchedule = {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
};

export interface QuickReply {
  label: string;
  message: string;
}

export const DAYS_OF_WEEK = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
] as const;

export const DAY_LABELS: Record<string, string> = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
};

export interface AdminSettings {
  // Profil & Cabinet
  business_name: string;
  business_specialty: string;
  business_zone: string;
  business_phone: string;
  business_email: string | null;
  business_inami: string | null;
  business_bce: string | null;
  admin_display_name: string | null;

  // Rendez-vous
  booking_max_days_ahead: number;
  booking_allow_sundays: boolean;

  // Chatbot IA
  chatbot_enabled: boolean;
  chatbot_model: string;
  chatbot_system_prompt: string | null;

  // WhatsApp
  whatsapp_ai_auto_reply: boolean;
  whatsapp_welcome_message: string;
  whatsapp_away_message: string;
  whatsapp_business_hours_enabled: boolean;
  whatsapp_business_hours: BusinessHoursSchedule;
  whatsapp_max_ai_messages: number;
  whatsapp_escalation_keywords: string[];
  whatsapp_quick_replies: QuickReply[];

  // Notifications (admin)
  notify_email_new_booking: boolean;
  notify_email_new_contact: boolean;
  notify_email_booking_reminder: boolean;
  notify_sound_alerts: boolean;

  // Notifications (patient)
  patient_notify_email: boolean;
  patient_notify_whatsapp: boolean;

  updated_at: string;
}

export const DEFAULT_SETTINGS: AdminSettings = {
  business_name: "Edem-Care",
  business_specialty: "Soins infirmiers à domicile",
  business_zone: "Bruxelles et alentours",
  business_phone: "+32 XXX XX XX XX",
  business_email: null,
  business_inami: null,
  business_bce: null,
  admin_display_name: null,

  booking_max_days_ahead: 60,
  booking_allow_sundays: false,

  chatbot_enabled: true,
  chatbot_model: "claude-3-5-sonnet-latest",
  chatbot_system_prompt: null,

  whatsapp_ai_auto_reply: true,
  whatsapp_welcome_message:
    "Bonjour ! Bienvenue chez Edem-Care, votre service de soins infirmiers à domicile à Bruxelles. Comment puis-je vous aider ?",
  whatsapp_away_message:
    "Merci pour votre message. Nous sommes actuellement fermés. Nos horaires sont du lundi au samedi, de 7h à 20h. Nous vous répondrons dès notre réouverture.",
  whatsapp_business_hours_enabled: true,
  whatsapp_business_hours: {
    monday:    { enabled: true,  start: "07:00", end: "20:00" },
    tuesday:   { enabled: true,  start: "07:00", end: "20:00" },
    wednesday: { enabled: true,  start: "07:00", end: "20:00" },
    thursday:  { enabled: true,  start: "07:00", end: "20:00" },
    friday:    { enabled: true,  start: "07:00", end: "20:00" },
    saturday:  { enabled: true,  start: "07:00", end: "20:00" },
    sunday:    { enabled: false, start: "07:00", end: "20:00" },
  },
  whatsapp_max_ai_messages: 10,
  whatsapp_escalation_keywords: [
    "urgence", "urgent", "douleur intense", "hémorragie",
    "112", "ambulance", "détresse respiratoire", "malaise grave",
  ],
  whatsapp_quick_replies: [],

  notify_email_new_booking: true,
  notify_email_new_contact: true,
  notify_email_booking_reminder: true,
  notify_sound_alerts: false,

  patient_notify_email: true,
  patient_notify_whatsapp: false,

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
