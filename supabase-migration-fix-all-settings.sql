-- ============================================================
-- EDEM-CARE SCHEMA FIX & SYNCHRONIZATION
-- ============================================================

-- 1. Ensure admin_settings table is fully up to date
ALTER TABLE public.admin_settings 
ADD COLUMN IF NOT EXISTS business_inami TEXT,
ADD COLUMN IF NOT EXISTS business_bce TEXT,
ADD COLUMN IF NOT EXISTS admin_display_name TEXT,
ADD COLUMN IF NOT EXISTS chatbot_provider TEXT DEFAULT 'anthropic',
ADD COLUMN IF NOT EXISTS chatbot_model TEXT DEFAULT 'claude-3-5-sonnet-latest',
ADD COLUMN IF NOT EXISTS whatsapp_ai_auto_reply BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS whatsapp_welcome_message TEXT DEFAULT 'Bonjour ! Comment puis-je vous aider ?',
ADD COLUMN IF NOT EXISTS whatsapp_away_message TEXT DEFAULT 'Nous sommes actuellement fermés. Nous vous répondrons dès que possible.',
ADD COLUMN IF NOT EXISTS whatsapp_business_hours_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_business_hours JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS whatsapp_max_ai_messages INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS whatsapp_escalation_keywords TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS whatsapp_quick_replies JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS notify_sound_alerts BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS patient_notify_email BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS patient_notify_whatsapp BOOLEAN DEFAULT false;

-- Add constraint for chatbot_provider if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_settings_chatbot_provider_check') THEN
        ALTER TABLE public.admin_settings ADD CONSTRAINT admin_settings_chatbot_provider_check CHECK (chatbot_provider IN ('anthropic', 'openai', 'google'));
    END IF;
END $$;

-- 2. Ensure chat_transcripts table exists (AI conversation logs)
CREATE TABLE IF NOT EXISTS public.chat_transcripts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  care_type_suggested text,
  booking_intent boolean DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure index exists
CREATE INDEX IF NOT EXISTS idx_chat_transcripts_session_id ON public.chat_transcripts (session_id);
CREATE INDEX IF NOT EXISTS idx_chat_transcripts_created_at ON public.chat_transcripts (created_at);

-- RLS: public can INSERT/UPDATE, authenticated can SELECT
ALTER TABLE public.chat_transcripts ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_transcripts' AND policyname = 'Anyone can insert chat transcripts') THEN
        CREATE POLICY "Anyone can insert chat transcripts" ON public.chat_transcripts FOR INSERT TO anon, authenticated WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_transcripts' AND policyname = 'Anyone can update their own transcript') THEN
        CREATE POLICY "Anyone can update their own transcript" ON public.chat_transcripts FOR UPDATE TO anon, authenticated USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_transcripts' AND policyname = 'Admins can select chat transcripts') THEN
        CREATE POLICY "Admins can select chat transcripts" ON public.chat_transcripts FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- Ensure metadata column exists if table already existed without it
ALTER TABLE public.chat_transcripts ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
