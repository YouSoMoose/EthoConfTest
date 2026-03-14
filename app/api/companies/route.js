import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const { data: companies, error } = await supabaseAdmin
    .from('companies')
    .select('*')
    .order('name', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Attach average votes
  const { data: votes } = await supabaseAdmin.from('votes').select('*');

  const companiesWithVotes = companies.map((c) => {
    const companyVotes = (votes || []).filter((v) => v.company_id === c.id);
    const count = companyVotes.length;
    if (count === 0) {
      return { ...c, avg_sustainability: 0, avg_impact: 0, avg_feasibility: 0, avg_overall: 0, vote_count: 0 };
    }
    return {
      ...c,
      avg_sustainability: companyVotes.reduce((s, v) => s + v.sustainability, 0) / count,
      avg_impact: companyVotes.reduce((s, v) => s + v.impact, 0) / count,
      avg_feasibility: companyVotes.reduce((s, v) => s + v.feasibility, 0) / count,
      avg_overall: companyVotes.reduce((s, v) => s + v.overall, 0) / count,
      vote_count: count,
    };
  });

  return NextResponse.json(companiesWithVotes);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.profile?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { name, description, logo_url, website, deck_link, category } = body;

  if (!name?.trim()) return NextResponse.json({ error: 'Company name is required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('companies')
    .insert({
      name: name.trim(),
      description: description || '',
      logo_url: logo_url || '',
      website: website || '',
      deck_link: deck_link || '',
      category: category || '',
      user_id: session.profile.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session?.profile?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { id, name, description, logo_url, website, deck_link, category } = body;

  if (!id) return NextResponse.json({ error: 'Company ID required' }, { status: 400 });

  // Allow the company owner OR a super admin (level 3) to update
  const { data: existing } = await supabaseAdmin.from('companies').select('user_id').eq('id', id).single();
  const isOwner = existing?.user_id === session.profile.id;
  const isSuperAdmin = session.profile.access_level >= 3;

  if (!isOwner && !isSuperAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from('companies')
    .update({
      name: name || '',
      description: description || '',
      logo_url: logo_url || '',
      website: website || '',
      deck_link: deck_link || '',
      category: category || '',
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
