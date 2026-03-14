import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.profile || session.profile.access_level < 2) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const { user_id } = body;

  if (!user_id) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user_id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (profile.checked_in) {
    return NextResponse.json({ error: 'Already checked in', profile }, { status: 409 });
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({
      checked_in: true,
      checked_in_at: new Date().toISOString(),
    })
    .eq('id', user_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
