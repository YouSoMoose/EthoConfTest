import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const { data: companies, error } = await supabaseAdmin
    .from('companies')
    .select('*')
    .order('name', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Attach average votes
  const { data: votes } = await supabaseAdmin.from('votes').select('*');

  const companiesWithVotes = companies.map((c) => {
    const companyVotes = (votes || []).filter((v) => v.company_id === c.id);
    const count = companyVotes.length;
    if (count === 0) {
      return { ...c, avg_sustainability: 0, avg_impact: 0, avg_feasibility: 0, avg_overall: 0, vote_count: 0 };
    }
    return {
      ...c,
      avg_sustainability: companyVotes.reduce((s, v) => s + v.sustainability, 0) / count,
      avg_impact: companyVotes.reduce((s, v) => s + v.impact, 0) / count,
      avg_feasibility: companyVotes.reduce((s, v) => s + v.feasibility, 0) / count,
      avg_overall: companyVotes.reduce((s, v) => s + v.overall, 0) / count,
      vote_count: count,
    };
  });

  return NextResponse.json(companiesWithVotes);
}
