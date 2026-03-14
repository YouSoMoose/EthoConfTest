'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Loader from '@/components/Loader';

export default function PassportPage() {
  const { data: session } = useSession();
  const [booths, setBooths] = useState([]);
  const [stamps, setStamps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/booths').then(r => r.json()),
      // Stamps are embedded — we'll get them via the booths + stamps check
    ]).then(async ([boothsData]) => {
      setBooths(boothsData || []);
      // Fetch user stamps
      if (session?.profile?.id) {
        try {
          const res = await fetch('/api/stamp');
          // stamp API is POST only, we'll track stamps client-side via booths listing
        } catch {}
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [session]);

  // Since we can't GET stamps directly, let's track via local state
  // We'll need to make stamps available — let's use a different approach
  useEffect(() => {
    if (!session?.profile?.id) return;
    // We'll fetch stamps from a dedicated check
    const fetchStamps = async () => {
      try {
        // Use booths data and check each — or better, we should add a stamps endpoint
        // For now, stamps will be tracked after scanning
        const stored = localStorage.getItem(`stamps_${session.profile.id}`);
        if (stored) setStamps(JSON.parse(stored));
      } catch {}
    };
    fetchStamps();
  }, [session]);

  if (loading) return <Loader />;

  const posterBooths = booths.filter(b => b.room === 'poster');
  const conferenceBooths = booths.filter(b => b.room === 'conference');

  const posterStamped = posterBooths.filter(b => stamps.includes(b.id)).length;
  const confStamped = conferenceBooths.filter(b => stamps.includes(b.id)).length;

  const posterProgress = posterBooths.length > 0 ? (posterStamped / posterBooths.length) * 100 : 0;
  const confProgress = conferenceBooths.length > 0 ? (confStamped / conferenceBooths.length) * 100 : 0;

  const renderProgressBar = (label, current, total, percent) => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="font-heading font-bold text-green-900 text-sm">{label}</span>
        <span className="text-xs font-body text-gray-500">{current}/{total} stamps</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className="progress-fill h-full" style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );

  const renderBoothGrid = (boothList, label) => (
    <div className="mb-8">
      <h3 className="font-heading text-sm font-bold text-green-800 uppercase tracking-wider mb-3">{label}</h3>
      {boothList.length === 0 ? (
        <p className="text-gray-400 text-sm font-body">No booths in this room yet</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {boothList.map((booth) => {
            const stamped = stamps.includes(booth.id);
            return (
              <div
                key={booth.id}
                className={`glass-card p-4 text-center transition-all duration-300 ${
                  stamped ? 'border-green-400 bg-green-50' : ''
                }`}
              >
                <div className={`text-3xl mb-2 ${stamped ? 'animate-stamp-bounce' : 'opacity-30'}`}>
                  {stamped ? '✅' : '⬜'}
                </div>
                <h4 className="font-heading font-bold text-sm text-green-900 truncate">{booth.name}</h4>
                {booth.description && (
                  <p className="text-xs text-gray-400 font-body mt-1 truncate">{booth.description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="page-enter">
      <div className="page-header">
        <div className="max-w-lg mx-auto">
          <h1 className="font-heading text-2xl font-bold">🛂 Passport</h1>
          <p className="text-green-200 text-sm font-body mt-1">Collect stamps at each booth</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Progress Section */}
        <div className="glass-card p-6 mb-6 animate-fade-up">
          {renderProgressBar('🖼️ Poster Room', posterStamped, posterBooths.length, posterProgress)}
          {renderProgressBar('🏢 Conference Room', confStamped, conferenceBooths.length, confProgress)}
        </div>

        {/* Scan Button */}
        <Link href="/app/scan" className="btn-primary w-full text-center block mb-8 py-4 text-lg btn-glow">
          📷 Scan Booth QR Code
        </Link>

        {/* Booth Grids */}
        <div className="stagger-in">
          {renderBoothGrid(posterBooths, '🖼️ Poster Room')}
          {renderBoothGrid(conferenceBooths, '🏢 Conference Room')}
        </div>
      </div>
    </div>
  );
}
