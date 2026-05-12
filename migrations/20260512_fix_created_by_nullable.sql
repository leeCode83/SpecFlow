-- Migration: Fix created_by nullable + auto-set trigger
-- Date: 2026-05-12
-- This migration makes the created_by column nullable and adds a trigger
-- to auto-populate it from auth.uid() when not provided by the client.

-- 1. Make created_by nullable (allows client-side inserts via RLS without explicitly passing created_by)
ALTER TABLE project_invitations
  ALTER COLUMN created_by DROP NOT NULL;

-- 2. Function to auto-set created_by from auth.uid() on INSERT
CREATE OR REPLACE FUNCTION set_created_by()
RETURNS trigger AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql security definer;

-- 3. Trigger to call the function before INSERT
CREATE TRIGGER project_invitations_set_created_by
  BEFORE INSERT ON project_invitations
  FOR EACH ROW
  WHEN (NEW.created_by IS NULL)
  EXECUTE FUNCTION set_created_by();
