'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Loader from '@/components/Loader';
import StarRating from '@/components/StarRating';

export default function PitchesPage() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/companies')
      .then(r => r.json())
      .then(data => { setCompanies(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const filtered = companies.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-enter">
      <div className="page-header">
        <div className="max-w-lg mx-auto">
          <h1 className="font-heading text-2xl font-bold">🎤 Pitches</h1>
          <p className="text-green-200 text-sm font-body mt-1">Rate company presentations</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <input
          type="text"
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field mb-6"
        />

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🎤</p>
            <p className="font-body">No companies found</p>
          </div>
        ) : (
          <div className="space-y-3 stagger-in">
            {filtered.map((company) => (
              <Link key={company.id} href={`/app/pitches/${company.id}`}>
                <div className="glass-card p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-amber-50 flex items-center justify-center flex-shrink-0">
                    {company.logo_url ? (
                      <img src={company.logo_url} alt={company.name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <span className="text-2xl">🏢</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-green-900 truncate">{company.name}</h3>
                    {company.category && (
                      <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-body">
                        {company.category}
                      </span>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <StarRating value={Math.round(company.avg_overall || 0)} readonly size={14} />
                    <p className="text-xs text-gray-400 font-body mt-1">
                      {company.vote_count || 0} vote{company.vote_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
