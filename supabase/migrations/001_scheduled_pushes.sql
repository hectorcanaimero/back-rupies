-- Migration: 001_scheduled_pushes
-- Creates the scheduled_pushes table, pg_cron extension, processing function, and cron job

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create scheduled_pushes table
CREATE TABLE public.scheduled_pushes (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT        NOT NULL,
  body           TEXT        NOT NULL,
  image_url      TEXT,
  data_payload   JSONB,
  target_type    TEXT        NOT NULL
                   CHECK (target_type IN ('all', 'topic', 'token', 'users')),
  target_value   TEXT,       -- topic name, FCM token, or NULL for 'all'
  target_users   JSONB,      -- array of { id, fcmToken } for target_type = 'users'
  scheduled_at   TIMESTAMPTZ NOT NULL,
  status         TEXT        NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  error_message  TEXT,
  sent_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by     UUID
);

-- Index for efficient polling of pending pushes ordered by schedule time
CREATE INDEX idx_scheduled_pushes_pending_scheduled_at
  ON public.scheduled_pushes (scheduled_at)
  WHERE status = 'pending';

-- Function: process_scheduled_pushes
-- Called every minute by pg_cron to mark due pending pushes as sent.
-- The actual FCM dispatch is handled by an Edge Function that reads 'sent'
-- records (or this function can be extended to invoke net.http_post).
CREATE OR REPLACE FUNCTION public.process_scheduled_pushes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.scheduled_pushes
  SET
    status  = 'sent',
    sent_at = now()
  WHERE id IN (
    SELECT id
    FROM   public.scheduled_pushes
    WHERE  status       = 'pending'
      AND  scheduled_at <= now()
    FOR UPDATE SKIP LOCKED
  );
END;
$$;

-- Schedule cron job: run process_scheduled_pushes every minute
SELECT cron.schedule(
  'process-scheduled-pushes',   -- job name (unique)
  '* * * * *',                  -- every minute
  'SELECT public.process_scheduled_pushes()'
);
