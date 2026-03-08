
-- Drop the public resumes RLS policy
DROP POLICY IF EXISTS "Anyone can view public resumes" ON public.resumes;

-- Drop the columns
ALTER TABLE public.resumes DROP COLUMN IF EXISTS is_public;
ALTER TABLE public.resumes DROP COLUMN IF EXISTS public_slug;
