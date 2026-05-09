-- Enable Row Level Security (RLS) for the storage.objects table if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 1. Create the bucket if it doesn't exist (optional, but good for completeness)
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-assets', 'project-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public read access to the project-assets bucket
-- This allows anyone to view the uploaded files (like images, documents) if they have the URL.
CREATE POLICY "Public Read Access for project-assets"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'project-assets' );

-- 3. Allow authenticated users to upload files to project-assets
CREATE POLICY "Authenticated users can upload files to project-assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'project-assets' );

-- 4. Allow users to update their own files
CREATE POLICY "Users can update their own files in project-assets"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'project-assets' AND owner = auth.uid() );

-- 5. Allow users to delete their own files
CREATE POLICY "Users can delete their own files in project-assets"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'project-assets' AND owner = auth.uid() );
