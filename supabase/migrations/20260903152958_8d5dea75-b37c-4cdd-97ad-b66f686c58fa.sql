-- Extensions needed for scheduling + outbound HTTP
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Table that records the heartbeat
CREATE TABLE IF NOT EXISTS public.keep_alive (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  note text NOT NULL DEFAULT 'keep-alive ping',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.keep_alive TO authenticated;
GRANT ALL ON public.keep_alive TO service_role;

ALTER TABLE public.keep_alive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view keep alive records"
ON public.keep_alive
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Heartbeat function: writes a row, prunes old rows, and pings the public REST API
CREATE OR REPLACE FUNCTION public.run_keep_alive()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  INSERT INTO public.keep_alive (note) VALUES ('automated keep-alive');

  DELETE FROM public.keep_alive WHERE created_at < now() - interval '30 days';

  PERFORM net.http_get(
    url := 'https://izewlxunmlajqiryapgh.supabase.co/rest/v1/keep_alive?select=id&limit=1',
    headers := jsonb_build_object(
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6ZXdseHVubWxhanFpcnlhcGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NjU5NjgsImV4cCI6MjA4ODU0MTk2OH0.2qUPPE6LQbwbbZugTrMuKuAOQ1zx-QAZvOkYbZnM5nw',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6ZXdseHVubWxhanFpcnlhcGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NjU5NjgsImV4cCI6MjA4ODU0MTk2OH0.2qUPPE6LQbwbbZugTrMuKuAOQ1zx-QAZvOkYbZnM5nw'
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.run_keep_alive() FROM PUBLIC, anon, authenticated;

-- Schedule twice a day (06:00 and 18:00 UTC)
DO $$
BEGIN
  PERFORM cron.unschedule('keep-alive-heartbeat');
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$;

SELECT cron.schedule(
  'keep-alive-heartbeat',
  '0 6,18 * * *',
  $$SELECT public.run_keep_alive();$$
);

-- Run once right now so activity is registered immediately
SELECT public.run_keep_alive();
