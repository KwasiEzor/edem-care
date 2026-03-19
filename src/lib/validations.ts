import { z } from "zod";

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
  care_type: z.string().optional(),
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
  care_type: z.string().min(1, "Veuillez sélectionner un type de soins"),
  patient_notes: z.string().max(1000, "Les notes sont trop longues").optional(),
  date: z.string().min(1, "Veuillez sélectionner une date"),
  time_slot_start: z.string().min(1, "Veuillez sélectionner un créneau"),
  time_slot_end: z.string().min(1),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;
