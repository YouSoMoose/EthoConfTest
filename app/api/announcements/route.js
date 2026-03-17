import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const url = new URL(request.url);
  const fetchAll = url.searchParams.get('all') === 'true';

  let query = supabaseAdmin
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  if (!fetchAll) {
    // Standard view: last 3 days, limit 10
    const since = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte('created_at', since).limit(10);
  } else {
    // Admin view: check session
    const session = await getServerSession(authOptions);
    if (!session?.profile || session.profile.access_level < 3) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.profile || session.profile.access_level < 3) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const { title, content } = body;

  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('announcements')
    .insert({ title: title.trim(), content: content || '' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session?.profile || session.profile.access_level < 3) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('announcements')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
