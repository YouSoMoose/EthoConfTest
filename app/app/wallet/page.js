'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Loader from '@/components/Loader';

export default function WalletPage() {
  const [walletItems, setWalletItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/wallet')
      .then(r => r.json())
      .then(data => { setWalletItems(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const removeItem = async (companyId) => {
    try {
      await fetch(`/api/wallet?company_id=${companyId}`, { method: 'DELETE' });
      setWalletItems(prev => prev.filter(w => w.company_id !== companyId));
      toast.success('Removed from wallet');
    } catch {
      toast.error('Failed to remove');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-enter">
      <div className="page-header">
        <div className="max-w-lg mx-auto">
          <h1 className="font-heading text-2xl font-bold">💼 Wallet</h1>
          <p className="text-green-200 text-sm font-body mt-1">Saved company cards</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {walletItems.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">💼</p>
            <p className="font-body">No saved companies yet</p>
            <Link href="/app/pitches" className="btn-primary inline-block mt-4 btn-glow">Browse Pitches</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 stagger-in">
            {walletItems.map((item) => {
              const company = item.companies;
              if (!company) return null;
              return (
                <div key={item.id} className="glass-card p-4 text-center relative group">
                  <button
                    onClick={() => removeItem(item.company_id)}
                    className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    title="Remove"
                  >
                    ✕
                  </button>
                  <Link href={`/app/pitches/${company.id}`}>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-100 to-amber-50 flex items-center justify-center mx-auto mb-3">
                      {company.logo_url ? (
                        <img src={company.logo_url} alt={company.name} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <span className="text-2xl">🏢</span>
                      )}
                    </div>
                    <h3 className="font-heading font-bold text-sm text-green-900 truncate">{company.name}</h3>
                    {company.category && (
                      <span className="text-[10px] text-amber-700 font-body">{company.category}</span>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
