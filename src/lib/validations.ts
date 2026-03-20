import { z } from "zod";

const CARE_TYPE_VALUES = [
  "soins_generaux",
  "prise_de_sang",
  "injections",
  "pansements",
  "perfusions",
  "suivi_diabete",
  "soins_palliatifs",
  "autre",
] as const;

const timeSlotRegex = /^\d{2}:\d{2}(:\d{2})?$/;

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom est trop long"),
  email: z.string().email("Adresse email invalide"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d\s+()-]{8,20}$/.test(val),
      "Numéro de téléphone invalide"
    ),
  care_type: z.enum(CARE_TYPE_VALUES).optional().or(z.literal("")),
  message: z
    .string()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(2000, "Le message est trop long"),
  honeypot: z.string().max(0, "Spam détecté"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export const bookingFormSchema = z.object({
  patient_name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom est trop long"),
  patient_email: z.string().email("Adresse email invalide"),
  patient_phone: z
    .string()
    .min(8, "Numéro de téléphone invalide")
    .max(20, "Numéro de téléphone invalide")
    .regex(/^[\d\s+()-]+$/, "Numéro de téléphone invalide"),
  care_type: z.enum(CARE_TYPE_VALUES, {
    message: "Veuillez sélectionner un type de soins",
  }),
  patient_notes: z.string().max(1000, "Les notes sont trop longues").optional(),
  date: z.string().min(1, "Veuillez sélectionner une date"),
  time_slot_start: z
    .string()
    .min(1, "Veuillez sélectionner un créneau")
    .regex(timeSlotRegex, "Format de créneau invalide"),
  time_slot_end: z
    .string()
    .min(1)
    .regex(timeSlotRegex, "Format de créneau invalide"),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;

export const bookingUpdateSchema = z.object({
  booking_id: z.string().uuid(),
  date: z.string().min(1).optional(),
  time_slot_start: z
    .string()
    .regex(timeSlotRegex, "Format de créneau invalide")
    .optional(),
  time_slot_end: z
    .string()
    .regex(timeSlotRegex, "Format de créneau invalide")
    .optional(),
  patient_notes: z.string().max(1000).optional(),
  care_type: z.enum(CARE_TYPE_VALUES).optional(),
});

export const bookingCancelSchema = z.object({
  booking_id: z.string().uuid(),
});

export type BookingUpdateData = z.infer<typeof bookingUpdateSchema>;
