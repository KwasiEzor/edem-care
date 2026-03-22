import { z } from "zod";

const isServer = typeof window === "undefined";
const isBuild = process.env.NEXT_PHASE === "phase-production-build";

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: (isServer && !isBuild) ? z.string().min(1) : z.string().optional(),

  // AI
  ANTHROPIC_API_KEY: (isServer && !isBuild) ? z.string().min(1) : z.string().optional(),
  OPENAI_API_KEY: (isServer && !isBuild) ? z.string().min(1).optional() : z.string().optional(),
  GEMINI_API_KEY: (isServer && !isBuild) ? z.string().min(1).optional() : z.string().optional(),

  // WhatsApp
  WHATSAPP_ACCESS_TOKEN: z.string().min(1).optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1).optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().min(1).optional(),
  WHATSAPP_APP_SECRET: z.string().min(1).optional(),

  // Email
  RESEND_API_KEY: z.string().min(1).optional(),
  ADMIN_EMAIL: z.string().email().optional(),

  // Bot Protection
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
  TURNSTILE_SECRET_KEY: (isServer && !isBuild) ? z.string().min(1) : z.string().optional(),

  // Site
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN,
  WHATSAPP_APP_SECRET: process.env.WHATSAPP_APP_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});
