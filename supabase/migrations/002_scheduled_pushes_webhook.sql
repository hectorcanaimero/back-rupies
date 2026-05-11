-- Migration: 002_scheduled_pushes_webhook
-- Replaces the pg_cron job that calls a PL/pgSQL function with one that calls
-- the processing endpoint via HTTP (pg_net).
--
-- REQUIRED Supabase project settings (Dashboard → Settings → Configuration → Custom config):
--   app.settings.app_url       — e.g. https://your-project.vercel.app
--   app.settings.webhook_secret — shared secret validated by the API route

-- Enable pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove the old cron job that called the PL/pgSQL function directly
SELECT cron.unschedule('process-scheduled-pushes');

-- Create new cron job: POST to the processing endpoint every minute
SELECT cron.schedule(
  'process-scheduled-pushes',
  '* * * * *',
  $$
    SELECT net.http_post(
      url     := current_setting('app.settings.app_url') || '/api/push/process-scheduled',
      headers := jsonb_build_object(
        'Content-Type',    'application/json',
        'x-webhook-secret', current_setting('app.settings.webhook_secret')
      ),
      body    := '{}'::jsonb
    )
  $$
);
