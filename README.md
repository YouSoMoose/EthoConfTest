# Ethos 2026

🌿 A comprehensive event management web app built with Next.js 14, designed for the Ethos 2026 sustainability conference.

## Tech Stack

- **Next.js 14** (App Router)
- **NextAuth v4** with Google OAuth
- **Supabase** (database only — no Supabase Auth)
- **Tailwind CSS v3**
- **qrcode.react** for QR generation
- **jsqr** for QR scanning via camera
- **react-hot-toast** for notifications

## Getting Started

### 1. Set up Supabase

1. Create a new Supabase project.
2. Run the contents of `schema.sql` in the Supabase SQL Editor.
3. Copy your project URL, anon key, and service role key.

### 2. Set up Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create OAuth 2.0 credentials.
3. Add these to **Authorized Redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://YOUR_VERCEL_URL/api/auth/callback/google`

### 3. Configure Environment Variables

Update `.env.local` with your credentials:

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 4. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Access Levels

| Level | Role           | Dashboard |
|-------|----------------|-----------|
| 0     | Attendee       | `/app`    |
| 1     | Company        | `/company`|
| 2     | Staff          | `/admin`  |
| 3     | Super Admin    | `/admin`  |

Admins can change user access levels via the admin portal or directly in Supabase.

## Core Features

- **Interactive Attendee Dashboard**: Real-time schedules, beautiful company pitches with 4-category voting, passport stamps, internal messaging, personal notes, and a digital check-in wallet.
- **Dynamic Onboarding & Tutorials**: 
  - Comprehensive first-time setup containing an auto-popup Liability Waiver.
  - Step-by-step interactive UI highlights teaching attendees how to navigate the app.
  - Smart "Waiting for Scan" overlays that auto-scroll and disable inputs until check-in is complete.
- **Robust QR Architecture**:
  - `jsqr` camera scanning for instantaneous booth check-ins and networking.
  - Real-time "You Just Got Scanned!" celebratory animations pushed directly to the attendee's phone via Supabase Realtime (with localized polling fallbacks).
- **Gamified Engagement**:
  - Passport system tracking booth interactions.
  - Automatic Silent Raffle entry seamlessly triggered when an attendee completes all booth stamps and votes.
- **Advanced Networking**:
  - Attendees can upload and update custom profile pictures (avatars fetched dynamically to avoid cookie bloat).
  - Tap-to-swap digital business card UI.

## Staff & Admin Capabilities

- **Tiered Role Access**: Attendee (0), Company (1), Event Staff (2), Super Admin (3).
- **Dedicated Staff Portal**:
  - Isolated `/staff-invite` portal granting instant Level 2 scanner access securely.
  - Unified Admin Switch UI featuring a slick 50/50 toggle for shifting between management modes.
- **Real-Time Data Views**:
  - Admin tables for Users, Schedules, Announcements, and Raffles perfectly sync natively without requiring page refreshes using `postgres_changes`.
- **Session Management Failsafes (Vercel 431 Mitigations)**:
  - *Extremely* lightweight Session JWTs limiting NextAuth cookie sizes to bypass iOS Safari 431 errors.
  - **Global Soft-Logout (`/logout`)**: Universal session killer with physical Admin projection capabilities.
  - **Failsafe Hard-Reset (`/reset`)**: A critical nuclear option designed explicitly to wipe stuck/legacy `sb-access-token` cookies.
  - Super Admins have dedicated QR Code projections for both escapes, alongside real-time 'Force Kick' capability on any attendee's device.
