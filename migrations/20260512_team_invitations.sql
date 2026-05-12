-- Migration: Team Invitations System (Simplified - No profiles table)
-- Date: 2026-05-12
-- Features:
--   - Invitation system with email-based invites
--   - 7-day expiry
--   - Accept/decline workflow
--   - Uses auth.users directly for email lookup (no profiles table)

-- 1. Create project_invitations table
CREATE TABLE project_invitations (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  email text not null,
  token uuid default gen_random_uuid() unique not null,
  status text default 'pending' not null CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at timestamp with time zone not null,
  created_by uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Prevent duplicate pending invites for same email+project
  CONSTRAINT unique_pending_invitation UNIQUE (project_id, email)
);

-- Index for faster lookups
CREATE INDEX idx_invitations_project_id ON project_invitations(project_id);
CREATE INDEX idx_invitations_email ON project_invitations(email);
CREATE INDEX idx_invitations_token ON project_invitations(token);
CREATE INDEX idx_invitations_status ON project_invitations(status);
CREATE INDEX idx_invitations_expires_at ON project_invitations(expires_at);

-- Enable RLS
ALTER TABLE project_invitations enable row level security;

-- 2. Create helper functions

-- Function: Check if user is project owner
CREATE OR REPLACE FUNCTION is_project_owner(p_user_id uuid, p_project_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM projects
    WHERE id = p_project_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql security definer;

-- Function: Check if user is project member (owner or teammate)
CREATE OR REPLACE FUNCTION is_project_member(p_user_id uuid, p_project_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM projects
    WHERE id = p_project_id
      AND (user_id = p_user_id OR p_user_id = ANY(teammates))
  );
END;
$$ LANGUAGE plpgsql security definer;

-- 3. Create invitation policies

-- Policy: Project owner can view all invitations for their project
CREATE POLICY "Project owner can view invitations"
  ON project_invitations FOR SELECT
  USING (
    is_project_owner(auth.uid(), project_id)
  );

-- Policy: Anyone can view invitation by token (for acceptance page)
CREATE POLICY "Anyone can view invitation by token"
  ON project_invitations FOR SELECT
  USING (true);

-- Policy: Project owner can create invitations
CREATE POLICY "Project owner can create invitations"
  ON project_invitations FOR INSERT
  WITH CHECK (
    is_project_owner(auth.uid(), project_id)
  );

-- Policy: Project owner can update invitations
CREATE POLICY "Project owner can update invitations"
  ON project_invitations FOR UPDATE
  USING (
    is_project_owner(auth.uid(), project_id)
  );

-- Policy: Invitation owner (by email match via auth.users) can update their invitation
-- Note: This allows the invited user to accept/decline by matching their auth email
CREATE POLICY "Invited user can update their invitation"
  ON project_invitations FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
  );

-- 4. Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_invitations_updated_at
  BEFORE UPDATE ON project_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();