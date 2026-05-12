-- Migration: Add project_github table for synced GitHub repository metadata
CREATE TABLE IF NOT EXISTS public.project_github (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    description TEXT,
    stars INTEGER DEFAULT 0,
    language TEXT,
    topics TEXT[],
    default_branch TEXT NOT NULL DEFAULT 'main',
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add unique constraint so each project has at most one github sync row
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_github_project_id ON public.project_github(project_id);

-- Enable RLS
ALTER TABLE public.project_github ENABLE ROW LEVEL SECURITY;

-- RLS: users can read their own project's github data
CREATE POLICY "Users can read own project github" ON public.project_github
    FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
    );

-- RLS: service role can insert/update (server-side sync)
-- (no additional policy needed, service_role bypasses RLS)
