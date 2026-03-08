
-- Create app_settings table
CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read settings
CREATE POLICY "Authenticated users can read settings"
ON public.app_settings FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert/update/delete settings
CREATE POLICY "Admins can manage settings"
ON public.app_settings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create branding storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding', 'branding', true);

-- Storage policies for branding bucket
CREATE POLICY "Anyone can view branding files"
ON storage.objects FOR SELECT
USING (bucket_id = 'branding');

CREATE POLICY "Admins can upload branding files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'branding' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update branding files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'branding' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete branding files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'branding' AND public.has_role(auth.uid(), 'admin'));

-- Insert default logo setting
INSERT INTO public.app_settings (key, value) VALUES ('logo_url', NULL);
