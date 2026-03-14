import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.profile?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: connections, error } = await supabaseAdmin
      .from('connections')
      .select('id, scanned_id, created_at')
      .eq('user_id', session.profile.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch profile details for each connection
    if (connections.length > 0) {
      const ids = connections.map(c => c.scanned_id);
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, name, email, avatar, resume_link, phone, bio')
        .in('id', ids);
      
      const profileMap = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
      
      const enriched = connections.map(c => ({
        ...c,
        profile: profileMap[c.scanned_id] || null
      }));
      
      return NextResponse.json(enriched);
    }
    
    return NextResponse.json([]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.profile?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { scanned_id } = await req.json();
    if (!scanned_id) return NextResponse.json({ error: 'scanned_id required' }, { status: 400 });

    // If the QR code happens to be a URL containing the ID, extract the ID
    let finalScannedId = scanned_id;
    try {
      if (scanned_id.includes('http')) {
        const url = new URL(scanned_id);
        const parts = url.pathname.split('/');
        finalScannedId = parts[parts.length - 1]; // Assume ID is at the end of the URL path
      }
    } catch (e) {
      // Not a URL or failed to parse, use original scanned_id
    }

    if (finalScannedId === session.profile.id) {
      return NextResponse.json({ error: 'Cannot scan yourself' }, { status: 400 });
    }

    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, avatar, resume_link, phone, bio')
      .eq('id', finalScannedId)
      .single();

    if (profileError || !existingProfile) {
      return NextResponse.json({ error: 'Invalid QR Code. Person not found.' }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .from('connections')
      .insert({ user_id: session.profile.id, scanned_id: finalScannedId })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ message: 'Already connected', profile: existingProfile }, { status: 200 });
      }
      throw error;
    }

    return NextResponse.json({ ...data, profile: existingProfile });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.profile?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      await supabaseAdmin.from('connections').delete().match({ id, user_id: session.profile.id });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
