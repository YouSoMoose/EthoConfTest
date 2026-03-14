import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { booth_id } = body;

  if (!booth_id) {
    return NextResponse.json({ error: 'booth_id is required' }, { status: 400 });
  }

  // Verify booth exists
  const { data: booth } = await supabaseAdmin
    .from('booths')
    .select('id, name')
    .eq('id', booth_id)
    .single();

  if (!booth) {
    return NextResponse.json({ error: 'Booth not found' }, { status: 404 });
  }

  // Check if already stamped
  const { data: existing } = await supabaseAdmin
    .from('passport_stamps')
    .select('id')
    .eq('user_id', session.profile.id)
    .eq('booth_id', booth_id)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Already stamped', booth_name: booth.name }, { status: 409 });
  }

  // Insert stamp
  const { data, error } = await supabaseAdmin
    .from('passport_stamps')
    .insert({ user_id: session.profile.id, booth_id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Check raffle eligibility silently
  try {
    const { data: allBooths } = await supabaseAdmin.from('booths').select('id');
    const { data: stamps } = await supabaseAdmin
      .from('passport_stamps')
      .select('booth_id')
      .eq('user_id', session.profile.id);
    const { data: allCompanies } = await supabaseAdmin.from('companies').select('id');
    const { data: userVotes } = await supabaseAdmin
      .from('votes')
      .select('company_id')
      .eq('user_id', session.profile.id);

    const allStamped = allBooths && stamps && allBooths.length > 0 &&
      allBooths.every((b) => stamps.some((s) => s.booth_id === b.id));
    const allVoted = allCompanies && userVotes && allCompanies.length > 0 &&
      allCompanies.every((c) => userVotes.some((v) => v.company_id === c.id));

    if (allStamped && allVoted) {
      await supabaseAdmin
        .from('raffle_entries')
        .upsert({ user_id: session.profile.id }, { onConflict: 'user_id' });
    }
  } catch (e) {
    // Silently fail raffle check
  }

  return NextResponse.json({ ...data, booth_name: booth.name });
}
