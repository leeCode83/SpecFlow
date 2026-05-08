-- Migration: Add teammates to projects and update RLS policies
-- Date: 2026-05-08

-- 1. Add teammates column to projects
ALTER TABLE projects ADD COLUMN teammates uuid[] DEFAULT '{}';

-- 2. Update RLS Policies for Projects
-- First, drop existing policies
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

-- Create new policies
CREATE POLICY "Users can view their own and shared projects" 
ON projects FOR SELECT USING (
  auth.uid() = user_id OR auth.uid() = ANY(teammates)
);

CREATE POLICY "Users can insert their own projects" 
ON projects FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can update their own and shared projects" 
ON projects FOR UPDATE USING (
  auth.uid() = user_id OR auth.uid() = ANY(teammates)
) WITH CHECK (
  auth.uid() = user_id OR auth.uid() = ANY(teammates)
);

CREATE POLICY "Only owners can delete their projects" 
ON projects FOR DELETE USING (
  auth.uid() = user_id
);

-- 3. Update RLS Policies for Specs
-- First, drop existing policies
DROP POLICY IF EXISTS "Users can view specs of their projects" ON specs;
DROP POLICY IF EXISTS "Users can insert specs into their projects" ON specs;
DROP POLICY IF EXISTS "Users can update specs of their projects" ON specs;
DROP POLICY IF EXISTS "Users can delete specs of their projects" ON specs;

-- Create new policies
CREATE POLICY "Users can view shared specs" 
ON specs FOR SELECT USING (
  project_id IN (
    SELECT id FROM projects 
    WHERE user_id = auth.uid() OR auth.uid() = ANY(teammates)
  )
);

CREATE POLICY "Users can insert shared specs" 
ON specs FOR INSERT WITH CHECK (
  project_id IN (
    SELECT id FROM projects 
    WHERE user_id = auth.uid() OR auth.uid() = ANY(teammates)
  )
);

CREATE POLICY "Users can update shared specs" 
ON specs FOR UPDATE USING (
  project_id IN (
    SELECT id FROM projects 
    WHERE user_id = auth.uid() OR auth.uid() = ANY(teammates)
  )
) WITH CHECK (
  project_id IN (
    SELECT id FROM projects 
    WHERE user_id = auth.uid() OR auth.uid() = ANY(teammates)
  )
);

CREATE POLICY "Only owners can delete specs" 
ON specs FOR DELETE USING (
  project_id IN (
    SELECT id FROM projects 
    WHERE user_id = auth.uid()
  )
);
