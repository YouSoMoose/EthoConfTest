import { supabaseAdmin } from '../../../../lib/supabase';

export async function POST(request) {
  if (!supabaseAdmin) {
    return new Response(JSON.stringify({ error: 'Supabase admin client not configured on server.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const { name, points, perPersonKg } = body || {};
  if (!name || points == null) {
    return new Response(JSON.stringify({ error: 'Missing required fields: name or points' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const insertPayload = {
      name: String(name).slice(0, 100),
      points: Number(points),
      per_person_kg: perPersonKg == null ? null : Number(perPersonKg),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin.from('game_leaderboard').insert(insertPayload).select();
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, row: data?.[0] || null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || 'Unknown error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
