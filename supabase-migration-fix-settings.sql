-- Fix: Add missing chatbot_model column to admin_settings
ALTER TABLE admin_settings 
ADD COLUMN IF NOT EXISTS chatbot_model TEXT DEFAULT 'claude-3-5-sonnet-latest';
