import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('schedule_items')
    .select('*');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  // Sort chronologically by parsing start_time (e.g., "9:00 AM", "1:00 PM")
  const parseTime = (t) => {
    if (!t) return 9999; // Put items without time at the end
    const match = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 9999;
    let [ , h, m, ampm ] = match;
    h = parseInt(h, 10);
    m = parseInt(m, 10);
    if (h === 12) h = 0; // 12 AM is 0:00, 12 PM is 12:00
    if (ampm.toUpperCase() === 'PM') h += 12;
    return h * 60 + m;
  };

  // Create a copy of the array and sort it
  const sortedData = [...data].sort((a, b) => parseTime(a.start_time) - parseTime(b.start_time));

  return NextResponse.json(sortedData);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.profile || session.profile.access_level < 2) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const { data, error } = await supabaseAdmin
    .from('schedule_items')
    .insert(body)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session?.profile || session.profile.access_level < 2) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const { id, ...updates } = body;
  const { data, error } = await supabaseAdmin
    .from('schedule_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session?.profile || session.profile.access_level < 2) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const { error } = await supabaseAdmin
    .from('schedule_items')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
