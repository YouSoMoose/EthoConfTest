import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  // Return the most recent announcement from the last 24 hours
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from('announcements')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(5);

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
