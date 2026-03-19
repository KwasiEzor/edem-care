-- ============================================================
-- AI & Data Features Migration
-- Tables: page_views, chat_transcripts
-- RPC: get_page_view_stats
-- ============================================================

-- 1. Page Views — anonymous visitor tracking
CREATE TABLE IF NOT EXISTS page_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path text NOT NULL,
  referrer_origin text,          -- domain only, no full URL
  session_hash text,             -- daily-rotating anonymous hash
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_page_views_created_at ON page_views (created_at);
CREATE INDEX idx_page_views_page_path ON page_views (page_path);

-- RLS: public can INSERT, authenticated can SELECT
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views"
  ON page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read page views"
  ON page_views FOR SELECT
  TO authenticated
  USING (true);


-- 2. Chat Transcripts — AI conversation logs
CREATE TABLE IF NOT EXISTS chat_transcripts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  care_type_suggested text,
  booking_intent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_chat_transcripts_session_id ON chat_transcripts (session_id);
CREATE INDEX idx_chat_transcripts_created_at ON chat_transcripts (created_at);

-- RLS: public can INSERT/UPDATE, authenticated can SELECT
ALTER TABLE chat_transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert chat transcripts"
  ON chat_transcripts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update their chat transcript"
  ON chat_transcripts FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read chat transcripts"
  ON chat_transcripts FOR SELECT
  TO authenticated
  USING (true);


-- 3. RPC: get_page_view_stats — daily aggregates
CREATE OR REPLACE FUNCTION get_page_view_stats(
  start_date date,
  end_date date
)
RETURNS TABLE (
  view_date date,
  view_count bigint,
  unique_sessions bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    (created_at AT TIME ZONE 'Europe/Brussels')::date AS view_date,
    count(*) AS view_count,
    count(DISTINCT session_hash) AS unique_sessions
  FROM page_views
  WHERE (created_at AT TIME ZONE 'Europe/Brussels')::date BETWEEN start_date AND end_date
  GROUP BY view_date
  ORDER BY view_date;
$$;
