-- =====================================================
-- Dualite Showcase: Complete Database Schema
-- =====================================================
-- This file contains everything needed to set up the database
-- from scratch. Run this in your Supabase SQL editor.
-- =====================================================

-- ----------------------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------------------
-- Stores public user data, linked to Supabase's auth users.
--
CREATE TABLE IF NOT EXISTS public.users (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email character varying(255) UNIQUE,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- RLS Policies for `users` table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to users" ON public.users;
CREATE POLICY "Allow public read access to users"
    ON public.users FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.users;
CREATE POLICY "Allow users to update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- ----------------------------------------------------------------
-- 2. PROJECTS TABLE
-- ----------------------------------------------------------------
-- Stores project submissions from users.
--
CREATE TABLE IF NOT EXISTS public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title character varying(100) NOT NULL,
    vercel_url text NOT NULL UNIQUE,
    description character varying(500) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON public.projects(user_id);

-- RLS Policies for `projects` table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to projects" ON public.projects;
CREATE POLICY "Allow public read access to projects"
    ON public.projects FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow users to insert their own projects" ON public.projects;
CREATE POLICY "Allow users to insert their own projects"
    ON public.projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update their own projects" ON public.projects;
CREATE POLICY "Allow users to update their own projects"
    ON public.projects FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own projects" ON public.projects;
CREATE POLICY "Allow users to delete their own projects"
    ON public.projects FOR DELETE
    USING (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- 3. VOTES TABLE
-- ----------------------------------------------------------------
-- Tracks upvotes on projects.
--
CREATE TABLE IF NOT EXISTS public.votes (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT votes_user_id_project_id_key UNIQUE (user_id, project_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS votes_user_id_idx ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS votes_project_id_idx ON public.votes(project_id);

-- RLS Policies for `votes` table
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to votes" ON public.votes;
CREATE POLICY "Allow public read access to votes"
    ON public.votes FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow users to insert their own votes" ON public.votes;
CREATE POLICY "Allow users to insert their own votes"
    ON public.votes FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        -- Prevent users from voting on their own projects
        NOT EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = votes.project_id AND p.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Allow users to delete their own votes" ON public.votes;
CREATE POLICY "Allow users to delete their own votes"
    ON public.votes FOR DELETE
    USING (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- 4. DATABASE FUNCTIONS & TRIGGERS
-- ----------------------------------------------------------------
-- Function to create a public user profile when a new auth user signs up.
--
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Trigger to call the function on new user creation in auth.users.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------
-- 5. DATABASE VIEWS
-- ----------------------------------------------------------------
-- A view to simplify fetching projects with their vote counts and user emails.
--
CREATE OR REPLACE VIEW public.projects_with_votes AS
SELECT
    p.id,
    p.user_id,
    p.title,
    p.vercel_url,
    p.description,
    p.created_at,
    u.email as user_email,
    (SELECT count(*) FROM public.votes v WHERE v.project_id = p.id) as vote_count
FROM
    public.projects p
JOIN
    public.users u ON p.user_id = u.id;

-- ----------------------------------------------------------------
-- 6. SAMPLE DATA (OPTIONAL)
-- ----------------------------------------------------------------
-- Uncomment the following lines to add some sample data for testing

/*
-- Insert sample users (you'll need to create these users in Supabase Auth first)
INSERT INTO public.users (id, email) VALUES 
('sample-user-1', 'demo1@example.com'),
('sample-user-2', 'demo2@example.com');

-- Insert sample projects
INSERT INTO public.projects (user_id, title, vercel_url, description) VALUES 
('sample-user-1', 'My Awesome Project', 'https://my-project.vercel.app', 'A really cool project built with Dualite!'),
('sample-user-2', 'Another Great App', 'https://another-app.vercel.app', 'Another amazing project showcasing Dualite capabilities.');
*/

-- ----------------------------------------------------------------
-- 7. VERIFICATION QUERIES
-- ----------------------------------------------------------------
-- Run these queries to verify everything is set up correctly

-- Check if tables exist
SELECT 'users' as table_name, COUNT(*) as row_count FROM public.users
UNION ALL
SELECT 'projects' as table_name, COUNT(*) as row_count FROM public.projects
UNION ALL
SELECT 'votes' as table_name, COUNT(*) as row_count FROM public.votes;

-- Check if policies are enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('users', 'projects', 'votes');

-- Check if trigger exists
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check if view exists
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' AND table_name = 'projects_with_votes';

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Your database is now ready for the Dualite Showcase application.
-- 
-- Next steps:
-- 1. Set up your frontend environment variables
-- 2. Test the application
-- 3. Create your first user account
-- =====================================================
