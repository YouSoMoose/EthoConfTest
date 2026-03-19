import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { age_range, signature_data } = await request.json();

  // For this application, we simply update the 'liability' column to TRUE.
  // In a production app, you might want to store the full signature_data 
  // in a separate 'signed_waivers' table for legal audit trails.
  
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ 
      liability: true,
      // We could store the metadata here if we had columns, 
      // but for now we follow the "one time only" TRUE/FALSE logic requested.
    })
    .eq('id', session.profile.id)
    .select()
    .single();

  if (error) {
    console.error('Database error during liability update:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, profile: data });
}
