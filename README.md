# Ethos 2025 — React App

Full-featured student entrepreneurship conference app built with React + Vite + Supabase.

## File Structure

```
ethos-app/
├── index.html
├── vite.config.js
├── package.json
├── .env.example              ← copy to .env and fill in keys
│
└── src/
    ├── main.jsx              ← React entry point
    ├── App.jsx               ← Router + auth gating
    │
    ├── lib/
    │   ├── supabase.js       ← Supabase client
    │   ├── constants.js      ← ACCESS_LEVELS, RATING_QUESTIONS, etc.
    │   └── utils.js          ← timeAgo, strColor, hasBadWords, etc.
    │
    ├── hooks/
    │   ├── useAuth.jsx       ← Auth context + Google OAuth
    │   └── useToast.jsx      ← Global toast notifications
    │
    ├── styles/
    │   └── globals.css       ← All global styles + CSS variables
    │
    ├── components/           ← Reusable UI pieces
    │   ├── Avatar.jsx
    │   ├── BottomNav.jsx
    │   ├── Loader.jsx
    │   ├── Modal.jsx
    │   ├── QRCode.jsx
    │   ├── RoleChip.jsx
    │   └── Topbar.jsx
    │
    ├── pages/
    │   ├── DemoLanding.jsx   ← Pre-login marketing page
    │   ├── LoginPage.jsx     ← Google OAuth login
    │   │
    │   ├── attendee/         ← L0 + L1 app
    │   │   ├── AttendeeLayout.jsx
    │   │   ├── HomePage.jsx
    │   │   ├── SchedulePage.jsx
    │   │   ├── ScheduleDetail.jsx
    │   │   ├── PitchesPage.jsx
    │   │   ├── PitchVotePage.jsx
    │   │   ├── PassportPage.jsx
    │   │   ├── MorePage.jsx
    │   │   ├── NotesPage.jsx
    │   │   ├── NoteEditorPage.jsx
    │   │   ├── ChatPage.jsx
    │   │   ├── MyCardPage.jsx
    │   │   ├── WalletPage.jsx
    │   │   ├── ScanPage.jsx
    │   │   └── ProfilePage.jsx
    │   │
    │   └── admin/            ← L2 + L3 admin panel
    │       ├── AdminLayout.jsx
    │       ├── AdminDash.jsx
    │       ├── AdminCheckin.jsx
    │       ├── AdminMessages.jsx
    │       ├── AdminCompanies.jsx
    │       ├── AdminUsers.jsx
    │       ├── AdminSchedule.jsx
    │       └── AdminRaffle.jsx
```

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add environment variables
```bash
cp .env.example .env
# Fill in your Supabase URL and anon key
```

### 3. Run the Supabase SQL schema
- Go to your Supabase Dashboard → SQL Editor
- Run the contents of `supabase-setup.sql` (from previous output)

### 4. Configure Google OAuth
- Supabase Dashboard → Authentication → Providers → Google → Enable
- Add your domain to Redirect URLs in Auth settings

### 5. Run locally
```bash
npm run dev
```

### 6. Build for GitHub Pages
```bash
npm run build
# Deploy the dist/ folder to GitHub Pages
```

## Access Levels

| Level | Role        | Access |
|-------|-------------|--------|
| 0     | Attendee    | Full attendee app |
| 1     | Presenter   | Attendee app + can create company card |
| 2     | Staff       | Admin panel: check-in + messages |
| 3     | Super Admin | Full admin: companies, users, schedule, raffle |

**To set yourself as Super Admin:**
1. Sign in with Google (creates your profile automatically)
2. Supabase Dashboard → Table Editor → `profiles` → find your row → set `access_level = 3`
3. After that, manage all users from Admin → Users

## Key Features

- 🔐 Google OAuth with automatic profile creation
- 📊 Access-level routing (attendee/admin views auto-determined by level)
- 🗓️ Schedule with room filter + detail view
- 🏆 Pitch room with 4-question 1–10 rating system
- 🗺️ Passport system with stamp grid + progress bars
- 🎟️ Silent raffle entry (no UI hint to attendees)
- 📝 Personal notes with create/edit/delete
- 💬 Attendee↔Staff chat with rate limiting + content filter
- 💼 Booth wallet for saved business cards
- 🪪 Personal QR card with resume link
- 📷 QR scan page (manual paste; camera requires HTTPS + html5-qrcode)
- 📣 Admin broadcast messages
- ✅ Staff check-in panel
