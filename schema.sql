-- Ethos 2026 Database Schema
-- Run this in your Supabase SQL Editor

-- Enable uuid generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar TEXT,
  access_level INT DEFAULT 0,
  checked_in BOOL DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  resume_link TEXT,
  liability BOOLEAN DEFAULT NULL,
  force_logout BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist for existing profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS card_made BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS in_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS force_logout BOOLEAN DEFAULT FALSE;

-- Schedule Items
CREATE TABLE IF NOT EXISTS schedule_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TEXT,
  end_time TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  contact_email TEXT,
  website TEXT,
  deck_link TEXT,
  logo_url TEXT,
  resume_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  sustainability INT CHECK (sustainability >= 1 AND sustainability <= 5),
  impact INT CHECK (impact >= 1 AND impact <= 5),
  feasibility INT CHECK (feasibility >= 1 AND feasibility <= 5),
  overall INT CHECK (overall >= 1 AND overall <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- Voting Settings
CREATE TABLE IF NOT EXISTS voting_settings (
  id INT PRIMARY KEY DEFAULT 1,
  locked BOOL DEFAULT FALSE,
  locked_at TIMESTAMPTZ,
  locked_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Booths
CREATE TABLE IF NOT EXISTS booths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  room TEXT CHECK (room IN ('poster', 'conference', 'other')),
  description TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Passport Stamps
CREATE TABLE IF NOT EXISTS passport_stamps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  booth_id UUID REFERENCES booths(id) ON DELETE CASCADE,
  stamped_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, booth_id)
);

-- Notes
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Untitled',
  content TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOL DEFAULT FALSE,
  deleted BOOL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Raffle Entries
CREATE TABLE IF NOT EXISTS raffle_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet Items
CREATE TABLE IF NOT EXISTS wallet_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- Connections
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scanned_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, scanned_id)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booths ENABLE ROW LEVEL SECURITY;
ALTER TABLE passport_stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Public read policies (using DO to avoid errors if policies already exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read schedule_items') THEN
        CREATE POLICY "Public read schedule_items" ON schedule_items FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read companies') THEN
        CREATE POLICY "Public read companies" ON companies FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read booths') THEN
        CREATE POLICY "Public read booths" ON booths FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read announcements') THEN
        CREATE POLICY "Public read announcements" ON announcements FOR SELECT USING (true);
    END IF;
END
$$;

-- Seed voting_settings
INSERT INTO voting_settings (id, locked) VALUES (1, false) ON CONFLICT (id) DO NOTHING;

-- Seed schedule_items for March 21, 2026
-- Use a subquery to avoid duplicates if title/start_time matches
INSERT INTO schedule_items (title, description, location, start_time, end_time)
SELECT title, description, location, start_time, end_time
FROM (VALUES 
  ('Registration & Check-in', 'Arrive, check in, and pick up your attendee badge and materials.', 'Main Lobby', '9:00 AM', '9:30 AM'),
  ('Opening Ceremony', 'Welcome address, event overview, and keynote introduction.', 'Main Hall', '9:30 AM', '10:00 AM'),
  ('Keynote: Sustainability in Tech', 'A keynote presentation on building sustainable technology companies.', 'Main Hall', '10:00 AM', '10:45 AM'),
  ('Poster Session & Networking', 'Visit poster room booths, network with companies, and collect passport stamps.', 'Poster Room', '10:45 AM', '12:00 PM'),
  ('Lunch Break', 'Enjoy catered lunch and informal networking.', 'Cafeteria', '12:00 PM', '1:00 PM'),
  ('Company Pitch Presentations', 'Companies present their pitches. Vote on sustainability, impact, and feasibility.', 'Conference Room', '1:00 PM', '2:30 PM'),
  ('Workshop: Building Your Brand', 'Interactive workshop on personal branding and career development.', 'Workshop Room A', '2:30 PM', '3:30 PM'),
  ('Closing Ceremony & Awards', 'Announcement of top-voted companies, raffle drawing, and closing remarks.', 'Main Hall', '3:30 PM', '4:00 PM')
) as t(title, description, location, start_time, end_time)
WHERE NOT EXISTS (
    SELECT 1 FROM schedule_items WHERE schedule_items.title = t.title AND schedule_items.start_time = t.start_time
);
