-- Ensure all expected columns exist in admin_settings table
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
