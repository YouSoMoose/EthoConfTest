import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', session.profile.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session?.profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Create update object dynamically based on what's in body
  const updateData = {};
  if (body.resume_link !== undefined) updateData.resume_link = body.resume_link;
  if (body.phone !== undefined) updateData.phone = body.phone;
  if (body.bio !== undefined) updateData.bio = body.bio;
  if (body.role !== undefined) updateData.role = body.role;
  if (body.name !== undefined) updateData.name = body.name;
  if (body.company !== undefined) updateData.company = body.company;
  if (body.linkedin !== undefined) updateData.linkedin = body.linkedin;
  if (body.in_admin !== undefined) updateData.in_admin = body.in_admin;
  if (body.avatar !== undefined) updateData.avatar = body.avatar;
  
  updateData.card_made = true;

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(updateData)
    .eq('id', session.profile.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
