import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.profile || session.profile.access_level < 2) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session?.profile || session.profile.access_level < 3) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

  // Super admin can update: access_level, name, email, avatar, resume_link, checked_in
  const allowed = {};
  if (updates.access_level !== undefined) allowed.access_level = parseInt(updates.access_level);
  if (updates.name !== undefined) allowed.name = updates.name;
  if (updates.email !== undefined) allowed.email = updates.email;
  if (updates.avatar !== undefined) allowed.avatar = updates.avatar;
  if (updates.resume_link !== undefined) allowed.resume_link = updates.resume_link;
  if (updates.checked_in !== undefined) allowed.checked_in = updates.checked_in;
  if (updates.company !== undefined) allowed.company = updates.company;
  if (updates.linkedin !== undefined) allowed.linkedin = updates.linkedin;

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(allowed)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
