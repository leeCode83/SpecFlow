-- IdeaFrame Database Schema
-- Run these in your Supabase SQL Editor

-- Enable pgvector extension securely
create extension if not exists vector with schema public;

-- 1. Create Projects Table
create table projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text not null,
  mode text not null,
  refined_idea_json jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for user_id to speed up lookups
create index idx_projects_user_id on projects(user_id);

-- 2. Create Specs Table
create table specs (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects on delete cascade not null,
  title text not null,
  type text not null,
  content text not null,
  status text default 'draft' not null,
  embedding vector(768), 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for project_id
create index idx_specs_project_id on specs(project_id);
-- HNSW Index for vector search (Provides efficient similarity search)
create index on specs using hnsw (embedding vector_cosine_ops);

-- 3. Enable RLS
alter table projects enable row level security;
alter table specs enable row level security;

-- 4. Create Policies for Projects
create policy "Users can view their own projects" 
on projects for select using (auth.uid() = user_id);

create policy "Users can insert their own projects" 
on projects for insert with check (auth.uid() = user_id);

create policy "Users can update their own projects" 
on projects for update using (auth.uid() = user_id);

create policy "Users can delete their own projects" 
on projects for delete using (auth.uid() = user_id);

-- 5. Create Policies for Specs
create policy "Users can view specs of their projects" 
on specs for select using (
  project_id in (select id from projects where user_id = auth.uid())
);

create policy "Users can insert specs into their projects" 
on specs for insert with check (
  project_id in (select id from projects where user_id = auth.uid())
);

create policy "Users can update specs of their projects" 
on specs for update using (
  project_id in (select id from projects where user_id = auth.uid())
);

create policy "Users can delete specs of their projects" 
on specs for delete using (
  project_id in (select id from projects where user_id = auth.uid())
);
