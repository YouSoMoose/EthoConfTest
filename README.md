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

## Features

- **Attendee Dashboard**: Schedule, company pitches with voting, passport stamps, chat with staff, personal notes, digital wallet
- **Company Portal**: Edit company profile, view pitch ratings
- **Admin Panel**: Check-in scanner, message management, schedule editor, user management, raffle system
- **Passport System**: QR-based booth stamps with progress tracking
- **Voting System**: 4-category star ratings with admin lock capability
- **Silent Raffle**: Auto-entry when all booths stamped and all companies voted
