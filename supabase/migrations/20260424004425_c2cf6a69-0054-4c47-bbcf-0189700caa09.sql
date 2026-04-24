-- Create private storage bucket for extraction error reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('extraction-error-reports', 'extraction-error-reports', false)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone (anon + authenticated) to upload reports
CREATE POLICY "Anyone can upload extraction error reports"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'extraction-error-reports');
