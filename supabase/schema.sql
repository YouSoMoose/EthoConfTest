-- ============================================
-- EthoConf Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  access_level integer default 0 check (access_level >= 0 and access_level <= 3),
  resume_url text,
  checked_in boolean default false,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Admins can update any profile" on profiles for update using (
  exists (select 1 from profiles where id = auth.uid() and access_level >= 2)
);

-- 2. Companies
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  type text default 'pitch',            -- pitch | booth
  room_type text default 'poster_room', -- poster_room | conference_room
  description text,
  presenter_name text,
  logo_url text,
  resume_url text,
  emoji text default '🏢',
  created_at timestamptz default now()
);

alter table public.companies enable row level security;
create policy "Companies viewable by all" on companies for select using (true);
create policy "Admins manage companies" on companies for all using (
  exists (select 1 from profiles where id = auth.uid() and access_level >= 2)
);

-- 3. Votes
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  voter_id uuid references auth.users(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,
  ratings jsonb,
  created_at timestamptz default now(),
  unique(voter_id, company_id)
);

alter table public.votes enable row level security;
create policy "Users can insert own votes" on votes for insert with check (auth.uid() = voter_id);
create policy "Users can update own votes" on votes for update using (auth.uid() = voter_id);
create policy "Users can view own votes" on votes for select using (auth.uid() = voter_id);
create policy "Admins can view all votes" on votes for select using (
  exists (select 1 from profiles where id = auth.uid() and access_level >= 2)
);

-- 4. Schedule Items
create table if not exists public.schedule_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text,
  speaker text,
  description text,
  type text,
  start_time timestamptz,
  end_time timestamptz,
  created_at timestamptz default now()
);

alter table public.schedule_items enable row level security;
create policy "Schedule viewable by all" on schedule_items for select using (true);
create policy "Admins manage schedule" on schedule_items for all using (
  exists (select 1 from profiles where id = auth.uid() and access_level >= 2)
);

-- 5. Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  from_user_id text,
  from_name text,
  from_email text,
  to_user_id text,            -- user UUID, 'admin', or 'broadcast'
  body text,
  admin_reply text,
  replied_at timestamptz,
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;
create policy "Users can view own messages" on messages for select using (
  auth.uid()::text = from_user_id or auth.uid()::text = to_user_id or to_user_id = 'broadcast'
);
create policy "Users can insert messages" on messages for insert with check (auth.uid()::text = from_user_id);
create policy "Admins can view all messages" on messages for select using (
  exists (select 1 from profiles where id = auth.uid() and access_level >= 2)
);
create policy "Admins can update messages" on messages for update using (
  exists (select 1 from profiles where id = auth.uid() and access_level >= 2)
);
create policy "Admins can insert messages" on messages for insert with check (
  exists (select 1 from profiles where id = auth.uid() and access_level >= 2)
);

-- 6. Notes
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  body text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.notes enable row level security;
create policy "Users manage own notes" on notes for all using (auth.uid() = user_id);

-- 7. Passport Stamps
create table if not exists public.passport_stamps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,
  room_type text,
  scanned_at timestamptz default now(),
  unique(user_id, company_id)
);

alter table public.passport_stamps enable row level security;
create policy "Users manage own stamps" on passport_stamps for all using (auth.uid() = user_id);

-- 8. Collected Cards (Wallet)
create table if not exists public.collected_cards (
  id uuid primary key default gen_random_uuid(),
  collected_by uuid references auth.users(id) on delete cascade,
  name text,
  email text,
  role text,
  resume text,
  created_at timestamptz default now()
);

alter table public.collected_cards enable row level security;
create policy "Users manage own cards" on collected_cards for all using (auth.uid() = collected_by);

-- 9. Raffle Entries
create table if not exists public.raffle_entries (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  entered_at timestamptz default now()
);

alter table public.raffle_entries enable row level security;
create policy "Users can insert own raffle entry" on raffle_entries for insert with check (auth.uid() = user_id);
create policy "Users can view own raffle entry" on raffle_entries for select using (auth.uid() = user_id);
create policy "Admins can view all raffle entries" on raffle_entries for select using (
  exists (select 1 from profiles where id = auth.uid() and access_level >= 2)
);

-- 10. Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, access_level)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url',
    0
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enable Realtime on messages table
alter publication supabase_realtime add table messages;
