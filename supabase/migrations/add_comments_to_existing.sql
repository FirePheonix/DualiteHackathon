-- =====================================================
-- Add Comments Table to Existing Database
-- =====================================================
-- Run this SQL in your Supabase SQL editor to add comments functionality
-- to your existing Dualite Showcase database.
-- =====================================================

-- ----------------------------------------------------------------
-- COMMENTS TABLE
-- ----------------------------------------------------------------
-- Tracks comments on projects with support for nested replies.
--
CREATE TABLE IF NOT EXISTS public.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS comments_project_id_idx ON public.comments(project_id);
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON public.comments(created_at);

-- RLS Policies for `comments` table
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to comments" ON public.comments;
CREATE POLICY "Allow public read access to comments"
    ON public.comments FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow users to insert their own comments" ON public.comments;
CREATE POLICY "Allow users to insert their own comments"
    ON public.comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update their own comments" ON public.comments;
CREATE POLICY "Allow users to update their own comments"
    ON public.comments FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own comments" ON public.comments;
CREATE POLICY "Allow users to delete their own comments"
    ON public.comments FOR DELETE
    USING (auth.uid() = user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Trigger to automatically update updated_at on comment updates
DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------------
-- VERIFICATION QUERIES
-- ----------------------------------------------------------------
-- Run these queries to verify the comments table was created successfully

-- Check if comments table exists and has the correct structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'comments' 
ORDER BY ordinal_position;

-- Check if indexes were created
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'comments' 
    AND schemaname = 'public';

-- Check if RLS policies are enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'comments';

-- Check if trigger exists
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'update_comments_updated_at';

-- =====================================================
-- COMMENTS TABLE ADDED SUCCESSFULLY!
-- =====================================================
-- Your database now supports Product Hunt-like commenting functionality.
-- 
-- Next steps:
-- 1. Test the new commenting functionality in your application
-- 2. Verify that users can add, edit, and delete comments
-- 3. Test nested replies functionality
-- =====================================================
