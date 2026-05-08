-- SpecFlow Database Schema
-- Run these in your Supabase SQL Editor

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

-- 2. Create Specs Table
create table specs (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects on delete cascade not null,
  title text not null,
  type text not null,
  content text not null,
  status text default 'draft' not null,
  embedding vector(768), -- Enable pgvector extension first
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable RLS
alter table projects enable row level security;
alter table specs enable row level security;

-- 4. Create Policies
create policy "Users can manage their own projects" 
on projects for all 
using (auth.uid() = user_id);

create policy "Users can manage specs of their projects" 
on specs for all 
using (
  project_id in (
    select id from projects where user_id = auth.uid()
  )
);
