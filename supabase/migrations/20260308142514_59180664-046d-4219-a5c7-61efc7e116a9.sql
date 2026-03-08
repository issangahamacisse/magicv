
-- Add public sharing columns to resumes
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS public_slug text UNIQUE;

-- Allow anonymous users to view public resumes
CREATE POLICY "Anyone can view public resumes"
ON public.resumes
FOR SELECT
TO anon, authenticated
USING (is_public = true);
