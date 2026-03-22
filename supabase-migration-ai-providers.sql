-- Add chatbot_provider column to admin_settings
ALTER TABLE public.admin_settings 
ADD COLUMN IF NOT EXISTS chatbot_provider text DEFAULT 'anthropic';

-- Add check constraint for valid providers
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'admin_settings_chatbot_provider_check'
    ) THEN
        ALTER TABLE public.admin_settings 
        ADD CONSTRAINT admin_settings_chatbot_provider_check 
        CHECK (chatbot_provider IN ('anthropic', 'openai', 'google'));
    END IF;
END $$;
