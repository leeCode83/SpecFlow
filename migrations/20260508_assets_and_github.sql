-- Migration: Add github_url to projects and create project_files table
-- Date: 2026-05-08

-- 1. Add github_url to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS github_url TEXT;

-- 2. Create project_files table for Storage metadata
CREATE TABLE IF NOT EXISTS public.project_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    size BIGINT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON public.project_files(project_id);

-- Enable RLS
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- Policies for project_files
CREATE POLICY "Users can view files of their projects" 
ON public.project_files FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_files.project_id
        AND (p.user_id = auth.uid() OR auth.uid() = ANY(p.teammates))
    )
);

CREATE POLICY "Users can upload files to their projects" 
ON public.project_files FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_files.project_id
        AND (p.user_id = auth.uid() OR auth.uid() = ANY(p.teammates))
    )
);

CREATE POLICY "Users can delete their own uploaded files" 
ON public.project_files FOR DELETE USING (
    auth.uid() = user_id
);
