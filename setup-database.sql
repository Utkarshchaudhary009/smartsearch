-- Create Users Table
CREATE TABLE smartusers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  clerk_id TEXT UNIQUE NOT NULL, -- Clerk User ID (Primary link to Clerk)
  name TEXT, -- User's full name (can be derived from Clerk)
  email TEXT UNIQUE, -- User's email address (from Clerk)
  first_name TEXT, -- User's first name (from Clerk)
  last_name TEXT, -- User's last name (from Clerk)
  image_url TEXT, -- Profile picture URL from Clerk
  primary_email_address_id TEXT, -- ID of the primary email in Clerk (optional)
  primary_phone_number_id TEXT, -- ID of the primary phone number in Clerk (optional)
  phone TEXT, -- User's phone number (you might manage this separately or sync from Clerk if available)
  role TEXT DEFAULT 'user',
  email_verified_at TIMESTAMPTZ,
  phone_verified_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::JSONB,
  marketing_consent BOOLEAN DEFAULT FALSE
);

-- Add index for faster querying by clerk_id
CREATE INDEX idx_smartusers_clerk_id ON smartusers (clerk_id);

-- Enable Row Level Security on Tables
ALTER TABLE smartusers ENABLE ROW LEVEL SECURITY;

create policy "public can read users"
on public.smartusers
for select to anon
using (true);

create policy "users can update their own profile"
on public.smartusers
for update to anon
using (true);

-- write a schema to store chat history
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  clerk_id TEXT NOT NULL, -- Clerk User ID (Primary link to Clerk)
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  chat_slug TEXT NOT NULL
);

-- Add index for faster querying by chat_slug
CREATE INDEX idx_chat_history_id ON chat_history (id);
CREATE INDEX idx_chat_history_chat_slug ON chat_history (chat_slug);

-- Enable Row Level Security on Tables
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

create policy "public can read chat history"
on public.chat_history
for select to anon
using (true);

-- Add policy to allow authenticated users to insert into chat_history
create policy "authenticated users can insert chat history"
on public.chat_history
for insert to anon
using (true);

-- Add policy to allow users to update/delete their own chat history
create policy "users can update their own chat history"
on public.chat_history
for update to anon
using (true);

create policy "users can delete their own chat history"
on public.chat_history
for delete to anon
using (true);

-- Create functions for chat slug operations

-- Function to update chat slug name
CREATE OR REPLACE FUNCTION update_chat_slug(
  old_slug TEXT,
  new_slug TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE chat_history
  SET 
    chat_slug = new_slug,
    updated_at = NOW()
  WHERE chat_slug = old_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete all chats with a particular chat slug
CREATE OR REPLACE FUNCTION delete_chats_by_slug(
  target_slug TEXT
) RETURNS VOID AS $$
BEGIN
  DELETE FROM chat_history
  WHERE chat_slug = target_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a new table to store generated image metadata
CREATE TABLE generated_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    clerk_id TEXT NOT NULL, -- Link to the user who requested the image
    prompt TEXT NOT NULL, -- The prompt used for generation
    alt_text TEXT, -- Alt text for accessibility
    image_url TEXT NOT NULL UNIQUE, -- Public URL from Supabase Storage
    model_used TEXT, -- Which AI model generated the image
    metadata JSONB DEFAULT '{}'::JSONB -- Any additional metadata
);

-- Add indexes for faster querying
CREATE INDEX idx_generated_images_clerk_id ON generated_images (clerk_id);
CREATE INDEX idx_generated_images_image_url ON generated_images (image_url);

-- Enable Row Level Security on the new table
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generated_images table
-- Allow public read access (anyone can see image metadata - adjust if needed)
CREATE POLICY "Public can read generated images"
ON public.generated_images
FOR SELECT USING (true);

-- Allow authenticated users to insert their own image records
CREATE POLICY "Users can insert their own image metadata"
ON public.generated_images
FOR INSERT WITH CHECK (true); -- Assuming Clerk JWT populates auth.role()

-- Allow users to update their own image metadata (e.g., alt_text)
CREATE POLICY "Users can update their own image metadata"
ON public.generated_images
FOR UPDATE USING (true); -- Check against clerk_id in JWT

-- Allow users to delete their own image metadata
CREATE POLICY "Users can delete their own image metadata"
ON public.generated_images
FOR DELETE USING (true); -- Check against clerk_id in JWT


-- Supabase Storage Setup (Run these commands in your Supabase SQL Editor)
-- Note: Replace 'generated_images_bucket' with your desired bucket name if different.

-- 1. Create the storage bucket (if it doesn't exist)
-- Ensure RLS is enabled for storage objects in your Supabase project settings.
INSERT INTO storage.buckets (id, name, public, owner, file_size_limit, allowed_mime_types)
VALUES ('generated_images_bucket', 'generated_images_bucket', true, null, null, ARRAY['image/png', 'image/jpeg', 'image/webp']) -- Set public=true, specify allowed types
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, allowed_mime_types = EXCLUDED.allowed_mime_types; -- Update existing bucket settings if needed


-- 2. Create policies for the storage bucket
-- Policy: Allow public read access to all files in the bucket
-- Drop policy if it exists, then create
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'generated_images_bucket' );

-- Policy: Allow authenticated users (via service_role key from backend) to upload images
-- Drop policy if it exists, then create
DROP POLICY IF EXISTS "Allow Server Uploads" ON storage.objects;
CREATE POLICY "Allow Server Uploads"
ON storage.objects FOR INSERT
TO service_role -- Backend uses service_role key which bypasses RLS but good to be explicit
WITH CHECK ( bucket_id = 'generated_images_bucket' );


-- Optional: Policies for user-specific updates/deletes if needed later
-- These require more complex logic, potentially using object metadata or linking via the generated_images table.
-- For now, rely on the backend using the service_role key for management.
-- Example (Needs refinement based on actual metadata usage):
-- DROP POLICY IF EXISTS "Allow User Deletes" ON storage.objects;
-- CREATE POLICY "Allow User Deletes"
-- ON storage.objects FOR DELETE
-- USING ( bucket_id = 'generated_images_bucket' AND auth.uid()::text = (storage.foldername(name))[1] ); -- Example: if folders are named by user ID