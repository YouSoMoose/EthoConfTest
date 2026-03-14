'use client';

import { useEffect, useState } from 'react';
import StarRating from '@/components/StarRating';
import Loader from '@/components/Loader';

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/companies')
      .then(r => r.json())
      .then(data => { setCompanies(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="page-enter">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="font-heading text-2xl font-bold text-green-900 mb-6">🏢 Companies</h2>

        {companies.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🏢</p>
            <p className="font-body">No companies registered yet</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="bg-green-50">
                    <th className="text-left p-3 font-heading font-bold text-green-900">Company</th>
                    <th className="text-left p-3 font-heading font-bold text-green-900">Category</th>
                    <th className="text-center p-3 font-heading font-bold text-green-900">Votes</th>
                    <th className="text-center p-3 font-heading font-bold text-green-900">Avg Overall</th>
                    <th className="text-center p-3 font-heading font-bold text-green-900">Sustainability</th>
                    <th className="text-center p-3 font-heading font-bold text-green-900">Impact</th>
                    <th className="text-center p-3 font-heading font-bold text-green-900">Feasibility</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => (
                    <tr key={c.id} className="border-t border-amber-100 hover:bg-amber-50/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {c.logo_url ? (
                            <img src={c.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                          ) : (
                            <span className="text-lg">🏢</span>
                          )}
                          <span className="font-medium text-green-900">{c.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-500">{c.category || '—'}</td>
                      <td className="p-3 text-center">{c.vote_count || 0}</td>
                      <td className="p-3">
                        <div className="flex justify-center">
                          <StarRating value={Math.round(c.avg_overall || 0)} readonly size={14} />
                        </div>
                      </td>
                      <td className="p-3 text-center">{(c.avg_sustainability || 0).toFixed(1)}</td>
                      <td className="p-3 text-center">{(c.avg_impact || 0).toFixed(1)}</td>
                      <td className="p-3 text-center">{(c.avg_feasibility || 0).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
