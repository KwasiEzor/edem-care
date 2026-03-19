export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type CareType =
  | "soins_generaux"
  | "prise_de_sang"
  | "injections"
  | "pansements"
  | "perfusions"
  | "suivi_diabete"
  | "soins_palliatifs"
  | "autre";

export const CARE_TYPE_LABELS: Record<CareType, string> = {
  soins_generaux: "Soins généraux",
  prise_de_sang: "Prise de sang",
  injections: "Injections",
  pansements: "Pansements",
  perfusions: "Perfusions",
  suivi_diabete: "Suivi diabète",
  soins_palliatifs: "Soins palliatifs",
  autre: "Autre",
};

export type NotificationType =
  | "new_booking"
  | "new_contact"
  | "booking_confirmed"
  | "booking_cancelled";

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  patient_id: string | null;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  care_type: CareType;
  date: string;
  time_slot_start: string;
  time_slot_end: string;
  status: BookingStatus;
  admin_notes: string | null;
  patient_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  care_type: CareType | null;
  message: string;
  is_read: boolean;
  is_spam: boolean;
  created_at: string;
}

export interface TimeSlot {
  id: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  is_active: boolean;
  max_bookings: number;
  created_at: string;
}

export interface BlockedDate {
  id: string;
  date: string;
  reason: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
}
