# Carbon Game — embeddable carbon footprint calculator

Overview
- Simple static HTML/CSS/JS app designed to be hosted separately and embedded into an existing Next.js site via an `iframe` so it doesn't appear to be part of the host app.

Quick start (local)
1. Open the `carbon-game` folder in a simple static server or file preview.
2. Host it on any static hosting (Netlify, Vercel static, S3 + CloudFront).

Embed snippet (iframe)
```
<iframe src="https://your-host/carbon-game/" width="100%" height="700" style="border:0"></iframe>
```

Adding official formulas
- Open `js/formulas.js` and replace the placeholder coefficients with the numbers from your government Excel sheet. The file documents the expected fields and how `computeTotalPoints(responses)` is derived.
- Typical mapping: map Excel column for per-unit CO2 factors to the `COEFFICIENTS` values.

Next steps I can do for you
- Convert your Excel sheet automatically into `COEFFICIENTS` if you upload it.
- Expand questionnaire items, tune scoring function, or add gamification (badges, levels, progress sharing).
Leaderboard
- This app includes a client-side leaderboard that stores scores in the browser's `localStorage`.
- Entries are stored under the key `carbon_game_leaderboard_v1` and can be exported as JSON or cleared.
- Because the app is standalone/static, the leaderboard is local to each user's browser. If you want a shared global leaderboard, I can add a serverless integration (Firebase / Fauna / simple POST endpoint) — tell me which you'd prefer.
Server / Supabase integration (optional)
- The app includes a simple "Share score (server)" action on the results screen. It will POST a small JSON payload `{ name, points, perPersonKg, timestamp }` to whatever endpoint you supply.
- For a global leaderboard backed by Supabase, create a server-side function or an authenticated API route that accepts the POST and inserts into your Supabase `leaderboard` table. Do not embed your Supabase service key in client-side code.

Minimal Supabase example (server function)
1. Create a table `leaderboard` with columns: `id (uuid)`, `name (text)`, `points (int)`, `per_person_kg (numeric)`, `created_at (timestamp)`.
2. Create a serverless function (or server-side route) that accepts POST JSON and inserts into Supabase using the service role key.

Example payload the app posts:
```
{ "name": "Alice", "points": 42, "perPersonKg": 5123.4, "timestamp": 1670000000000 }
```

If you want, I can scaffold a simple Node/Express endpoint or a Supabase function template you can deploy and secure. Otherwise use the client-side prompt to paste your function URL and test submissions.

Supabase table schema (recommended)
1. In your Supabase project SQL editor enable the `pgcrypto` extension (for `gen_random_uuid()`):
```sql
create extension if not exists pgcrypto;
```

2. Create a `leaderboard` table for storing shared scores:
```sql
create table public.leaderboard (
	id uuid default gen_random_uuid() primary key,
	name text not null,
	points int not null,
	per_person_kg numeric not null,
	payload jsonb, -- optional full payload
	created_at timestamptz default now()
);
```

3. Insert example (server-side function should perform this using a SERVICE_ROLE key):
```sql
insert into public.leaderboard (name, points, per_person_kg, payload)
values ('Alice', 42, 5123.4, '{"notes":"test"}');
```

Security notes
- Do NOT embed your Supabase service role key in client-side code. Instead create a server-side function (Edge Function or serverless route) that accepts the POST from the app and inserts into Supabase using the service key. The app can POST to that function's URL.
- Alternatively, enable Row Level Security (RLS) and create a policy allowing authenticated users to insert, then have users sign in via Supabase Auth and POST directly using the anon key.

If you want, I can scaffold an example Supabase Edge Function (JavaScript) that accepts the posted payload and inserts into this table. Tell me if you want the Edge Function code.

Edge Function usage (your setup)
- I added a scaffolded Edge Function at `supabase-edge/submit-score/index.js` that inserts into your table. It expects the following environment variables set in the Edge Function deployment:
	- `SUPABASE_URL` — your Supabase project URL
	- `SUPABASE_SERVICE_ROLE_KEY` — service role key (keep secret)
	- `TABLE_NAME` — optional, defaults to `leaderboard`

Example client POST payload (include `user_id` if known):
```json
{
	"name": "Alice",
	"points": 42,
	"perPersonKg": 5123.4,
	"user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
	"payload": { "answers": { "showerLength": "5-10" } }
}
```

How to deploy
- Deploy the `supabase-edge/submit-score` folder as an Edge Function (Supabase Edge Functions or any serverless provider that supports the Node runtime). Set the env vars above in the function settings. The function returns the inserted row.

Security reminder
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to clients. The Edge Function should be the only consumer of the service role key.
