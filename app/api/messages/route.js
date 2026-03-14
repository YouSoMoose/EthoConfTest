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
  const unreadOnly = searchParams.get('unread');
  const userId = session.profile.id;
  const level = session.profile.access_level;

  // Unread count request
  if (unreadOnly === 'true') {
    const { count } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('read', false)
      .eq('deleted', false);

    return NextResponse.json({ unreadCount: count || 0 });
  }

  // Staff/admin: get all messages or messages for a specific user
  if (level >= 2) {
    const targetUser = searchParams.get('user_id');
    let query = supabaseAdmin
      .from('messages')
      .select('*, sender:profiles!sender_id(id, name, email, avatar), recipient:profiles!recipient_id(id, name, email, avatar)')
      .eq('deleted', false)
      .order('created_at', { ascending: true });

    if (targetUser) {
      query = query.or(`sender_id.eq.${targetUser},recipient_id.eq.${targetUser}`);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Attendees: get their own messages (to/from staff)
  const { data, error } = await supabaseAdmin
    .from('messages')
    .select('*, sender:profiles!sender_id(id, name, email, avatar), recipient:profiles!recipient_id(id, name, email, avatar)')
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .eq('deleted', false)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const level = session.profile.access_level;

  let recipientId = body.recipient_id;

  // Attendees auto-route to any staff member
  if (level < 2 && !recipientId) {
    const { data: staffMembers } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .gte('access_level', 2)
      .limit(1);

    if (staffMembers && staffMembers.length > 0) {
      recipientId = staffMembers[0].id;
    } else {
      return NextResponse.json({ error: 'No staff available' }, { status: 404 });
    }
  }

  const { data, error } = await supabaseAdmin
    .from('messages')
    .insert({
      sender_id: session.profile.id,
      recipient_id: recipientId,
      content: body.content,
    })
    .select('*, sender:profiles!sender_id(id, name, email, avatar), recipient:profiles!recipient_id(id, name, email, avatar)')
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

  // Mark messages as read
  if (body.mark_read) {
    const { error } = await supabaseAdmin
      .from('messages')
      .update({ read: true })
      .eq('recipient_id', session.profile.id)
      .eq('read', false);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session?.profile || session.profile.access_level < 2) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const { error } = await supabaseAdmin
    .from('messages')
    .update({ deleted: true })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
