-- Migration: 002_scheduled_pushes_webhook
-- Replaces the pg_cron job that calls a PL/pgSQL function with one that calls
-- the processing endpoint via HTTP (pg_net) with hardcoded values.

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
      url     := 'https://back-rupies.vercel.app/api/push/process-scheduled',
      headers := '{"Content-Type": "application/json", "x-webhook-secret": "@@v3n3zu3lan0!!"}'::jsonb,
      body    := '{}'::jsonb
    )
  $$
);
