-- Create storage bucket for template previews
INSERT INTO storage.buckets (id, name, public)
VALUES ('template-previews', 'template-previews', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to template previews
CREATE POLICY "Template previews are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'template-previews');

-- Allow service role to upload previews
CREATE POLICY "Service role can upload template previews"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'template-previews');