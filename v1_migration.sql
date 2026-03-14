-- Migration to V1: Person-to-Person connections instead of Companies

-- 1. Create connections table
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scanned_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, scanned_id)
);

-- Enable RLS for connections
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- 2. Add contact info to profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT;

-- 2. Drop legacy company-related tables
DROP TABLE IF EXISTS wallet_items CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS passport_stamps CASCADE;
DROP TABLE IF EXISTS booths CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS voting_settings CASCADE;
