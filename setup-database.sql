
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


-- write a schema to store chat history
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  clerk_id TEXT UNIQUE NOT NULL, -- Clerk User ID (Primary link to Clerk)
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  chat_slug TEXT NOT NULL,
);

-- Add index for faster querying by clerk_id
CREATE INDEX idx_chat_history_clerk_id ON chat_history (clerk_id);

-- Enable Row Level Security on Tables
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

create policy "public can read chat history"
on public.chat_history
for select to anon
using (true);