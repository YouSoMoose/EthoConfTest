'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Avatar from '@/components/Avatar';
import Loader from '@/components/Loader';

export default function AdminRafflePage() {
  const [entries, setEntries] = useState([]);
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/raffle')
      .then(r => r.json())
      .then(data => { setEntries(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const pickWinner = () => {
    if (entries.length === 0) {
      toast.error('No raffle entries');
      return;
    }
    const randomIndex = Math.floor(Math.random() * entries.length);
    setWinner(entries[randomIndex]);
    toast.success('Winner picked! 🎉');
  };

  if (loading) return <Loader />;

  return (
    <div className="page-enter">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-2xl font-bold text-green-900">🎰 Raffle</h2>
          <button onClick={pickWinner} className="btn-primary btn-glow">
            🎲 Pick Winner
          </button>
        </div>

        {/* Winner display */}
        {winner && (
          <div className="glass-card p-8 text-center mb-6 animate-scale-in border-2 border-amber-400">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="font-heading text-lg font-bold text-green-900 mb-2">Winner!</h3>
            <Avatar src={winner.profiles?.avatar} name={winner.profiles?.name} size={64} />
            <p className="font-heading text-xl font-bold text-green-900 mt-3">{winner.profiles?.name}</p>
            <p className="font-body text-gray-500 text-sm">{winner.profiles?.email}</p>
          </div>
        )}

        <p className="font-body text-gray-500 text-sm mb-4">
          {entries.length} total entr{entries.length === 1 ? 'y' : 'ies'}
        </p>

        {entries.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🎰</p>
            <p className="font-body">No raffle entries yet</p>
            <p className="font-body text-xs mt-2">Users qualify by stamping all booths and voting on all companies</p>
          </div>
        ) : (
          <div className="space-y-3 stagger-in">
            {entries.map((entry) => (
              <div key={entry.id} className={`glass-card p-4 flex items-center gap-3 ${winner?.id === entry.id ? 'border-2 border-amber-400 bg-amber-50' : ''}`}>
                <Avatar src={entry.profiles?.avatar} name={entry.profiles?.name} size={36} />
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-green-900">{entry.profiles?.name}</h3>
                  <p className="font-body text-xs text-gray-400">{entry.profiles?.email}</p>
                </div>
                <span className="text-xs text-gray-400 font-body">
                  {new Date(entry.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
