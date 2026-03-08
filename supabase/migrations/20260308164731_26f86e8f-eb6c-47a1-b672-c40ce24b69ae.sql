
-- Add attachment_url column to comments
ALTER TABLE public.comments ADD COLUMN attachment_url text;

-- Create comment-attachments storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('comment-attachments', 'comment-attachments', true);

-- RLS: Anyone can read files
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'comment-attachments');

-- RLS: Authenticated users can upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'comment-attachments');
