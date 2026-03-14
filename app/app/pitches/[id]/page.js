'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import StarRating from '@/components/StarRating';
import Loader from '@/components/Loader';

export default function PitchDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [company, setCompany] = useState(null);
  const [vote, setVote] = useState({ sustainability: 0, impact: 0, feasibility: 0, overall: 0 });
  const [existingVote, setExistingVote] = useState(null);
  const [votingLocked, setVotingLocked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/companies').then(r => r.json()),
      fetch(`/api/votes?company_id=${id}`).then(r => r.json()),
      fetch('/api/voting-settings').then(r => r.json()),
      fetch('/api/wallet').then(r => r.json()),
    ]).then(([companies, userVote, settings, wallet]) => {
      const comp = (companies || []).find(c => c.id === id);
      setCompany(comp || null);
      if (userVote) {
        setVote({
          sustainability: userVote.sustainability || 0,
          impact: userVote.impact || 0,
          feasibility: userVote.feasibility || 0,
          overall: userVote.overall || 0,
        });
        setExistingVote(userVote);
      }
      setVotingLocked(settings?.locked || false);
      setSaved((wallet || []).some(w => w.company_id === id));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleSubmitVote = async () => {
    if (vote.sustainability === 0 || vote.impact === 0 || vote.feasibility === 0 || vote.overall === 0) {
      toast.error('Please rate all categories');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: id, ...vote }),
      });
      if (res.ok) {
        toast.success(existingVote ? 'Vote updated!' : 'Vote submitted!');
        setExistingVote(await res.json());
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to submit vote');
      }
    } catch {
      toast.error('Network error');
    }
    setSubmitting(false);
  };

  const handleToggleWallet = async () => {
    try {
      if (saved) {
        await fetch(`/api/wallet?company_id=${id}`, { method: 'DELETE' });
        setSaved(false);
        toast.success('Removed from wallet');
      } else {
        await fetch('/api/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company_id: id }),
        });
        setSaved(true);
        toast.success('Saved to wallet!');
      }
    } catch {
      toast.error('Network error');
    }
  };

  if (loading) return <Loader />;
  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-body text-gray-500">Company not found</p>
          <button onClick={() => router.back()} className="btn-secondary mt-4">Go Back</button>
        </div>
      </div>
    );
  }

  const categories = [
    { key: 'sustainability', label: '🌱 Sustainability', icon: '🌱' },
    { key: 'impact', label: '💥 Impact', icon: '💥' },
    { key: 'feasibility', label: '⚙️ Feasibility', icon: '⚙️' },
    { key: 'overall', label: '⭐ Overall', icon: '⭐' },
  ];

  return (
    <div className="page-enter">
      <div className="page-header">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="text-white text-xl hover:opacity-80 transition-opacity">
            ←
          </button>
          <h1 className="font-heading text-xl font-bold truncate">{company.name}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Company Info */}
        <div className="glass-card p-6 animate-fade-up">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-amber-50 flex items-center justify-center flex-shrink-0">
              {company.logo_url ? (
                <img src={company.logo_url} alt={company.name} className="w-14 h-14 rounded-xl object-cover" />
              ) : (
                <span className="text-3xl">🏢</span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-xl font-bold text-green-900">{company.name}</h2>
              {company.category && (
                <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-body">{company.category}</span>
              )}
            </div>
            <button
              onClick={handleToggleWallet}
              className={`text-2xl transition-all duration-300 ${saved ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}
              title={saved ? 'Remove from wallet' : 'Save to wallet'}
            >
              {saved ? '💛' : '🤍'}
            </button>
          </div>

          {company.description && (
            <p className="text-gray-600 font-body text-sm mb-4">{company.description}</p>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm font-body">
            {company.contact_email && (
              <a href={`mailto:${company.contact_email}`} className="text-green-700 hover:underline truncate">
                ✉️ {company.contact_email}
              </a>
            )}
            {company.website && (
              <a href={company.website} target="_blank" rel="noreferrer" className="text-green-700 hover:underline truncate">
                🌐 Website
              </a>
            )}
            {company.deck_link && (
              <a href={company.deck_link} target="_blank" rel="noreferrer" className="text-green-700 hover:underline truncate">
                📊 Pitch Deck
              </a>
            )}
            {company.resume_link && (
              <a href={company.resume_link} target="_blank" rel="noreferrer" className="text-green-700 hover:underline truncate">
                📄 Resume
              </a>
            )}
          </div>
        </div>

        {/* Voting section */}
        <div className="glass-card p-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-heading text-lg font-bold text-green-900 mb-4">Rate This Pitch</h3>

          {votingLocked ? (
            <div className="text-center py-6">
              <p className="text-4xl mb-3">🔒</p>
              <p className="font-body text-gray-500">Voting is currently locked</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {categories.map((cat) => (
                  <div key={cat.key} className="flex items-center justify-between">
                    <span className="font-body text-sm text-gray-700">{cat.label}</span>
                    <StarRating
                      value={vote[cat.key]}
                      onChange={(v) => setVote(prev => ({ ...prev, [cat.key]: v }))}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubmitVote}
                disabled={submitting}
                className="btn-primary w-full mt-6 btn-glow"
              >
                {submitting ? 'Submitting...' : existingVote ? 'Update Vote' : 'Submit Vote'}
              </button>
            </>
          )}
        </div>

        {/* Average ratings */}
        <div className="glass-card p-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-heading text-lg font-bold text-green-900 mb-3">Average Ratings</h3>
          <div className="grid grid-cols-2 gap-4 text-sm font-body">
            <div className="flex items-center gap-2">
              <span>🌱</span>
              <span className="text-gray-600">Sustainability:</span>
              <span className="font-bold text-green-800">{(company.avg_sustainability || 0).toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💥</span>
              <span className="text-gray-600">Impact:</span>
              <span className="font-bold text-green-800">{(company.avg_impact || 0).toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⚙️</span>
              <span className="text-gray-600">Feasibility:</span>
              <span className="font-bold text-green-800">{(company.avg_feasibility || 0).toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⭐</span>
              <span className="text-gray-600">Overall:</span>
              <span className="font-bold text-green-800">{(company.avg_overall || 0).toFixed(1)}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 font-body mt-3">
            Based on {company.vote_count || 0} vote{company.vote_count !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
