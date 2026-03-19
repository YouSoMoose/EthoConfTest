-- Add missing columns to profiles table to fix 500 errors
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS in_admin BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS card_made BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS linkedin TEXT;

-- Verify other columns exist for V1 as well
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT;
