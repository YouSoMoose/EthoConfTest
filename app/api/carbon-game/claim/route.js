import { supabaseAdmin } from '../../../../lib/supabase';
import { getToken } from 'next-auth/jwt';

export async function POST(request) {
  if (!supabaseAdmin) return new Response(JSON.stringify({ error: 'Supabase admin client not configured.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

  const tokenJwt = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!tokenJwt) return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  let body;
  try { body = await request.json(); } catch (e) { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } }); }

  const { token } = body || {};
  if (!token) return new Response(JSON.stringify({ error: 'Missing token' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  try {
    const { data: row, error: selErr } = await supabaseAdmin.from('carbon_import_tokens').select('*').eq('token', token).single();
    if (selErr || !row) return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    if (row.used) return new Response(JSON.stringify({ error: 'Token already used' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    if (new Date(row.expires_at) < new Date()) return new Response(JSON.stringify({ error: 'Token expired' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const profileId = tokenJwt.profile?.id || tokenJwt.sub || null;

    // Insert into game_leaderboard linking to the claiming profile when available
    const insertPayload = {
      name: row.payload?.name || 'Imported',
      points: Number(row.payload?.points || 0),
      per_person_kg: row.payload?.perPersonKg == null ? null : Number(row.payload?.perPersonKg),
      profile_id: profileId,
      created_at: new Date().toISOString()
    };

    const { data: insertData, error: insertErr } = await supabaseAdmin.from('game_leaderboard').insert(insertPayload).select();
    if (insertErr) return new Response(JSON.stringify({ error: insertErr.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });

    // Mark token used
    await supabaseAdmin.from('carbon_import_tokens').update({ used: true, used_by: profileId, used_at: new Date().toISOString() }).eq('token', token);

    return new Response(JSON.stringify({ success: true, row: insertData?.[0] || null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || 'Unknown' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
