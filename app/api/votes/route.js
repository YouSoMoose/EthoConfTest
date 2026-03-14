import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('company_id');

  if (companyId) {
    const { data } = await supabaseAdmin
      .from('votes')
      .select('*')
      .eq('user_id', session.profile.id)
      .eq('company_id', companyId)
      .single();

    return NextResponse.json(data || null);
  }

  const { data } = await supabaseAdmin
    .from('votes')
    .select('*')
    .eq('user_id', session.profile.id);

  return NextResponse.json(data || []);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check voting lock
  const { data: settings } = await supabaseAdmin
    .from('voting_settings')
    .select('locked')
    .eq('id', 1)
    .single();

  if (settings?.locked) {
    return NextResponse.json({ error: 'Voting is currently locked' }, { status: 403 });
  }

  const body = await request.json();
  const voteData = {
    user_id: session.profile.id,
    company_id: body.company_id,
    sustainability: body.sustainability,
    impact: body.impact,
    feasibility: body.feasibility,
    overall: body.overall,
    updated_at: new Date().toISOString(),
  };

  // Upsert vote
  const { data: existing } = await supabaseAdmin
    .from('votes')
    .select('id')
    .eq('user_id', session.profile.id)
    .eq('company_id', body.company_id)
    .single();

  let data, error;
  if (existing) {
    ({ data, error } = await supabaseAdmin
      .from('votes')
      .update(voteData)
      .eq('id', existing.id)
      .select()
      .single());
  } else {
    ({ data, error } = await supabaseAdmin
      .from('votes')
      .insert(voteData)
      .select()
      .single());
  }

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

  return NextResponse.json(data);
}
