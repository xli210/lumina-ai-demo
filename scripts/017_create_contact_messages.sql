-- ============================================
-- TABLE: contact_messages
-- Messages from the /contact form: product ideas, bug reports, feature requests,
-- general questions, each with a way to reach the sender.
--
-- Written only by the server (service role) through /api/contact, which validates
-- the message and rate-limits by hashed IP. Nothing here stores a raw IP address.
-- Read only by admins (/admin/messages).
--
-- Requires: 001 (profiles.role) and the is_admin() helper from 005.
-- ============================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind        TEXT NOT NULL CHECK (kind IN ('feature', 'improvement', 'bug', 'question', 'business', 'other')),
  message     TEXT NOT NULL CHECK (char_length(message) BETWEEN 5 AND 4000),
  name        TEXT CHECK (name IS NULL OR char_length(name) <= 100),
  email       TEXT CHECK (email IS NULL OR char_length(email) <= 254),
  other_contact TEXT CHECK (other_contact IS NULL OR char_length(other_contact) <= 200),
  page        TEXT CHECK (page IS NULL OR char_length(page) <= 300),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_hash     TEXT,
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'done')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- at least one way to reply
  CHECK (email IS NOT NULL OR other_contact IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_ip_hash ON public.contact_messages(ip_hash, created_at DESC);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- No insert/update policy: only the service role (the API route) writes.
-- Admins can read.
DROP POLICY IF EXISTS "contact_messages_admin_select" ON public.contact_messages;
CREATE POLICY "contact_messages_admin_select"
  ON public.contact_messages FOR SELECT
  USING (public.is_admin());
