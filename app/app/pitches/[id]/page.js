'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Topbar from '@/components/Topbar';
import Loader from '@/components/Loader';
import StarRating from '@/components/StarRating';
import Btn from '@/components/Btn';
import Modal from '@/components/Modal';

export default function PitchDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [showVote, setShowVote] = useState(false);
  const [vote, setVote] = useState({ sustainability: 0, impact: 0, feasibility: 0, overall: 0 });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/companies').then(r => r.json()).then(list => {
      const c = (list || []).find(x => x.id === id);
      setCompany(c);
      setLoading(false);
    }).catch(() => setLoading(false));

    fetch('/api/wallet').then(r => r.json()).then(items => {
      if ((items || []).some(w => w.company_id === id)) setSaved(true);
    }).catch(() => {});
  }, [id]);

  const submitVote = async () => {
    setVoting(true);
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: id, ...vote }),
      });
      if (res.ok) { toast.success('Vote submitted!'); setShowVote(false); }
      else { const e = await res.json(); toast.error(e.error || 'Failed'); }
    } catch { toast.error('Network error'); }
    setVoting(false);
  };

  const toggleWallet = async () => {
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
        toast.success('Saved to wallet');
      }
    } catch { toast.error('Failed'); }
  };

  if (loading) return <Loader />;
  if (!company) return <div style={{ padding: 40, textAlign: 'center' }}>Company not found</div>;

  return (
    <div className="page-enter">
      <Topbar title={company.name} onBack={() => router.back()} />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px' }}>
        {/* Company info */}
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r)',
          padding: 20,
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, background: 'var(--s1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
            }}>
              {company.logo_url ? (
                <img src={company.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : <span style={{ fontSize: 28 }}>🏢</span>}
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 20, color: 'var(--text)' }}>
                {company.name}
              </h2>
              {company.category && (
                <span style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--muted)' }}>{company.category}</span>
              )}
            </div>
          </div>

          {company.description && (
            <p style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--sub)', lineHeight: 1.5, marginBottom: 16 }}>
              {company.description}
            </p>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" style={{
                fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--g)', background: 'var(--gl)',
                padding: '4px 10px', borderRadius: 8,
              }}>🌐 Website</a>
            )}
            {company.deck_link && (
              <a href={company.deck_link} target="_blank" rel="noopener noreferrer" style={{
                fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--g)', background: 'var(--gl)',
                padding: '4px 10px', borderRadius: 8,
              }}>📑 Pitch Deck</a>
            )}
          </div>

          {/* Ratings */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
            padding: 12, background: 'var(--s1)', borderRadius: 10,
          }}>
            {[
              { label: 'Overall', val: company.avg_overall },
              { label: 'Sustainability', val: company.avg_sustainability },
              { label: 'Impact', val: company.avg_impact },
              { label: 'Feasibility', val: company.avg_feasibility },
            ].map(r => (
              <div key={r.label}>
                <span style={{ fontFamily: 'var(--fb)', fontSize: 11, color: 'var(--muted)' }}>{r.label}</span>
                <StarRating value={Math.round(r.val || 0)} readonly size={14} />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn onClick={() => setShowVote(true)} style={{ flex: 1 }}>Vote</Btn>
          <Btn variant={saved ? 'outline' : 'outline'} onClick={toggleWallet} sm style={{ flexShrink: 0 }}>
            {saved ? '💼 Saved' : '💼 Save'}
          </Btn>
        </div>
      </div>

      {/* Vote Modal */}
      <Modal open={showVote} onClose={() => setShowVote(false)} title="Rate This Company" subtitle="Score each category from 1–5">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <StarRating label="Sustainability" value={vote.sustainability} onChange={v => setVote(p => ({ ...p, sustainability: v }))} />
          <StarRating label="Impact" value={vote.impact} onChange={v => setVote(p => ({ ...p, impact: v }))} />
          <StarRating label="Feasibility" value={vote.feasibility} onChange={v => setVote(p => ({ ...p, feasibility: v }))} />
          <StarRating label="Overall" value={vote.overall} onChange={v => setVote(p => ({ ...p, overall: v }))} />
          <Btn onClick={submitVote} disabled={voting}>{voting ? 'Submitting…' : 'Submit Vote'}</Btn>
        </div>
      </Modal>
    </div>
  );
}
