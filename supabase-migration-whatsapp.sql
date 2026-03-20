-- WhatsApp conversations table
CREATE TABLE whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  contact_name TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_ai_active BOOLEAN NOT NULL DEFAULT true,
  care_type_suggested TEXT,
  booking_intent BOOLEAN NOT NULL DEFAULT false,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wa_phone ON whatsapp_conversations (phone_number);
CREATE INDEX idx_wa_last_msg ON whatsapp_conversations (last_message_at DESC);

ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access whatsapp_conversations"
  ON whatsapp_conversations FOR ALL
  USING (auth.role() = 'authenticated');

-- Deduplication table (Meta retries webhooks)
CREATE TABLE whatsapp_message_ids (
  message_id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_conversations;
