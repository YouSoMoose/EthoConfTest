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
  const asAttendee = searchParams.get('as') === 'attendee';
  const userId = session.profile.id;
  const level = session.profile.access_level;

  // Unread count or latest unread message request
  if (unreadOnly === 'true') {
    const latest = searchParams.get('latest') === 'true';
    
    if (latest) {
      const { data, error } = await supabaseAdmin
        .from('messages')
        .select('*, sender:profiles!sender_id(id, name, email, avatar)')
        .eq('recipient_id', userId)
        .eq('read', false)
        .eq('deleted', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data || null);
    }

    const { count } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('read', false)
      .eq('deleted', false);

    return NextResponse.json({ unreadCount: count || 0 });
  }

  const directAdmin = searchParams.get('direct') === 'admin';

  // Staff/admin: get all messages or messages for a specific user
  if (level >= 3 && !asAttendee) {
    const targetUser = searchParams.get('user_id');
    let query = supabaseAdmin
      .from('messages')
      .select('*, sender:profiles!sender_id(id, name, email, avatar, access_level), recipient:profiles!recipient_id(id, name, email, avatar, access_level)')
      .eq('deleted', false)
      .order('created_at', { ascending: true });

    if (targetUser) {
      query = query.or(`sender_id.eq.${targetUser},recipient_id.eq.${targetUser}`);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Attendees & Staff (in attendee view): get direct conversation with admin
  if (directAdmin) {
    // First, get admin IDs (level >= 3)
    const { data: admins } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .gte('access_level', 3);

    const adminIds = (admins || []).map(a => a.id);

    if (adminIds.length === 0) {
      return NextResponse.json([]);
    }

    // Messages where (I sent to an admin) OR (an admin sent to me)
    const senderFilters = adminIds.map(id => `and(sender_id.eq.${userId},recipient_id.eq.${id})`).join(',');
    const recipientFilters = adminIds.map(id => `and(sender_id.eq.${id},recipient_id.eq.${userId})`).join(',');

    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*, sender:profiles!sender_id(id, name, email, avatar, access_level), recipient:profiles!recipient_id(id, name, email, avatar, access_level)')
      .eq('deleted', false)
      .or(`${senderFilters},${recipientFilters}`)
      .order('created_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Fallback or generic conversation
  const { data, error } = await supabaseAdmin
    .from('messages')
    .select('*, sender:profiles!sender_id(id, name, email, avatar, access_level), recipient:profiles!recipient_id(id, name, email, avatar, access_level)')
    .eq('deleted', false)
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const asAttendee = searchParams.get('as') === 'attendee';
  const directAdmin = searchParams.get('direct') === 'admin';
  const body = await request.json();
  const userId = session.profile.id;
  const level = session.profile.access_level;

  let recipientId = body.recipient_id;

  // Direct Admin Routing: Attendees/Staff auto-route to a Level 3 member
  if ((level < 3 || asAttendee || directAdmin) && !recipientId) {
    const { data: adminMembers } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .gte('access_level', 3)
      .limit(1);

    if (adminMembers && adminMembers.length > 0) {
      recipientId = adminMembers[0].id;
    } else {
      return NextResponse.json({ error: 'Support is currently unavailable' }, { status: 404 });
    }
  }

  const { data, error } = await supabaseAdmin
    .from('messages')
    .insert({
      sender_id: userId,
      recipient_id: recipientId,
      content: body.content,
    })
    .select('*, sender:profiles!sender_id(id, name, email, avatar, access_level), recipient:profiles!recipient_id(id, name, email, avatar, access_level)')
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
