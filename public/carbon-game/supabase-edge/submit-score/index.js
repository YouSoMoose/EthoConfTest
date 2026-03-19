import { createClient } from '@supabase/supabase-js'

// Supabase Edge Function: insert a leaderboard row into your table
// Expects env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TABLE_NAME (optional)

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  try {
    const body = await req.json()
    const { name, points, perPersonKg, payload, user_id } = body
    if (!name || points == null || perPersonKg == null) {
      return new Response(JSON.stringify({ error: 'missing fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const SUPABASE_URL = process.env.SUPABASE_URL
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    const TABLE = process.env.TABLE_NAME || 'leaderboard'

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return new Response(JSON.stringify({ error: 'server misconfigured' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    const insertObj = {
      name,
      points: Number(points),
      per_person_kg: Number(perPersonKg),
      payload: payload ? payload : null
    }

    if (user_id) insertObj.user_id = user_id

    const { error, data } = await supabase.from(TABLE).insert(insertObj).select()
    if (error) throw error

    return new Response(JSON.stringify({ ok: true, row: data && data[0] }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
