-- =====================================================
-- Add Media Support to Projects
-- =====================================================
-- This migration adds support for Google Drive images and YouTube videos
-- to enhance the project showcase experience.
-- =====================================================

-- ----------------------------------------------------------------
-- ADD MEDIA COLUMNS TO PROJECTS TABLE
-- ----------------------------------------------------------------
-- Add thumbnail_url column for Google Drive image
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS thumbnail_url text;

-- Add media_urls column for carousel (JSON array of URLs)
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS media_urls jsonb DEFAULT '[]'::jsonb;

-- Add index for thumbnail_url queries
CREATE INDEX IF NOT EXISTS projects_thumbnail_url_idx ON public.projects(thumbnail_url);

-- ----------------------------------------------------------------
-- UPDATE PROJECTS_WITH_VOTES VIEW
-- ----------------------------------------------------------------
-- Update the view to include the new media columns
DROP VIEW IF EXISTS public.projects_with_votes;
CREATE OR REPLACE VIEW public.projects_with_votes AS
SELECT
    p.id,
    p.user_id,
    p.title,
    p.vercel_url,
    p.description,
    p.thumbnail_url,
    p.media_urls,
    p.created_at,
    u.email as user_email,
    (SELECT count(*) FROM public.votes v WHERE v.project_id = p.id) as vote_count
FROM
    public.projects p
JOIN
    public.users u ON p.user_id = u.id;

-- ----------------------------------------------------------------
-- VERIFICATION QUERIES
-- ----------------------------------------------------------------
-- Check if new columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name IN ('thumbnail_url', 'media_urls')
ORDER BY column_name;

-- Check if view was updated
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' AND table_name = 'projects_with_votes';

-- =====================================================
-- MEDIA SUPPORT ADDED SUCCESSFULLY!
-- =====================================================
-- Your projects now support:
-- 1. Google Drive image thumbnails
-- 2. Media carousel with images and YouTube videos
-- 
-- Next steps:
-- 1. Update the frontend to handle the new media fields
-- 2. Test Google Drive image rendering
-- 3. Test YouTube video embedding
-- =====================================================
