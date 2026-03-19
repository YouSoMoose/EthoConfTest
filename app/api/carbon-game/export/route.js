import { supabaseAdmin } from '../../../../lib/supabase';

export async function POST(request) {
  if (!supabaseAdmin) {
    return new Response(JSON.stringify({ error: 'Supabase admin client not configured.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  let body;
  try { body = await request.json(); } catch (e) { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } }); }

  const { name, points, perPersonKg } = body || {};
  if (!name || points == null) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  const token = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : ('t_' + Math.random().toString(36).slice(2));
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

  const payload = { name, points: Number(points), perPersonKg: perPersonKg == null ? null : Number(perPersonKg) };

  try {
    const { data, error } = await supabaseAdmin.from('carbon_import_tokens').insert({ token, payload, expires_at: expiresAt, used: false, created_at: new Date().toISOString() }).select();
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    return new Response(JSON.stringify({ token }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || 'Unknown' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
