'use client';

import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import { MapPin } from 'lucide-react';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import Loader from '@/components/Loader';
import { Home, Calendar, Wallet, Scan, MessageCircle, FileText, CreditCard, ChevronRight, LogOut, Settings, Bell, ShieldCheck } from 'lucide-react';
import { CardPreview } from '@/components/CardPreview';
import { useScrollHero } from '@/lib/animations';
import AdminSwitch from '@/components/AdminSwitch';
import Modal from '@/components/Modal';
import LiabilityWaiver from '@/components/LiabilityWaiver';

const LIQUID = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const LIQUID_SLOW = 'cubic-bezier(0.32, 0.72, 0, 1)';

function AnnouncementCard({ a, index }) {
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef(null);
  const timeSince = Math.round((Date.now() - new Date(a.created_at).getTime()) / 60000);
  const timeLabel = timeSince < 1 ? 'just now' : timeSince < 60 ? `${timeSince}m ago` : `${Math.round(timeSince / 60)}h ago`;

  const handlePointerDown = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transition = 'transform 0.12s ease-out';
    cardRef.current.style.transform = 'scale(0.97)';
  };
  const handlePointerUp = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transition = `transform 0.5s ${LIQUID}`;
    cardRef.current.style.transform = 'scale(1)';
  };

  return (
    <div
      ref={cardRef}
      onClick={() => a.content && setExpanded(!expanded)}
      onPointerDown={a.content ? handlePointerDown : undefined}
      onPointerUp={a.content ? handlePointerUp : undefined}
      onPointerLeave={a.content ? handlePointerUp : undefined}
      style={{
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r)',
        padding: '16px',
        cursor: a.content ? 'pointer' : 'default',
        transform: 'scale(1)',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15, color: 'var(--text)', margin: 0 }}>
          {a.title}
        </h3>
        <span style={{ fontFamily: 'var(--fb)', fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
          {timeLabel}
        </span>
      </div>
      {a.content && (
        <div style={{
          overflow: 'hidden',
          transition: expanded 
            ? `max-height 0.5s ${LIQUID_SLOW}, margin 0.5s ${LIQUID_SLOW}, opacity 0.4s ${LIQUID_SLOW}`
            : `max-height 0.3s ease-in, margin 0.3s ease-in, opacity 0.2s ease-in`,
          maxHeight: expanded ? 500 : 0,
          marginTop: expanded ? 8 : 0,
          opacity: expanded ? 1 : 0,
        }}>
          <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--sub)', lineHeight: 1.4, paddingBottom: 4 }}>
            {a.content}
          </p>
        </div>
      )}
      {a.content && !expanded && (
        <div style={{
          display: 'flex', justifyContent: 'center', marginTop: 8,
          transition: `opacity 0.3s ${LIQUID_SLOW}`,
          opacity: expanded ? 0 : 1,
        }}>
          <div style={{ width: 32, height: 4, background: 'var(--s1)', borderRadius: 2 }} />
        </div>
      )}
    </div>
  );
}

export default function AttendeeDashboard() {
  const { data: session, update } = useSession();
  const [schedule, setSchedule] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customizations, setCustomizations] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [notifPermission, setNotifPermission] = useState('default');
  // Realtime listener for onboarding status changes (Waiver, Card, Check-in)
  useEffect(() => {
    if (!session?.profile?.id) return;

    const channel = import('@/lib/supabase').then(({ supabase }) => {
      return supabase
        .channel(`profile-status-${session.profile.id}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles', 
          filter: `id=eq.${session.profile.id}` 
        }, async (payload) => {
          console.log('[DEBUG] Realtime profile update:', payload.new);
          const freshProfile = payload.new;
          const old = session?.profile || {};
          
          // Check if key statuses changed
          const changed = 
            freshProfile.liability !== old.liability ||
            freshProfile.card_made !== old.card_made ||
            freshProfile.checked_in !== old.checked_in ||
            freshProfile.avatar !== old.avatar ||
            freshProfile.name !== old.name;
          
          if (changed) {
            await update({
              ...session,
              profile: freshProfile
            });
          }
        })
        .subscribe();
    });

    return () => {
      channel.then(c => import('@/lib/supabase').then(({ supabase }) => supabase.removeChannel(c)));
    };
  }, [session, update]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const heroRef = useScrollHero({ minScale: 0.96, distance: 180 });
  const cardPreviewRef = useRef(null);
  const notesCardRef = useRef(null);

  useEffect(() => {
    const fetchSched = fetch('/api/schedule').then(r => r.json());
    const fetchAnn = fetch(`/api/announcements?_t=${Date.now()}`).then(r => r.json());

    Promise.all([fetchSched, fetchAnn]).then(([sched, ann]) => {
      setSchedule(sched || []);
      setAnnouncements(ann || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const channelPromise = import('@/lib/supabase').then(({ supabase }) => {
      return supabase
        .channel('homepage-announcements')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, (payload) => {
          setAnnouncements(prev => [payload.new, ...prev]);
        })
        .subscribe();
    });

    return () => {
      channelPromise.then(c => import('@/lib/supabase').then(({ supabase }) => supabase.removeChannel(c)));
    };
  }, []);

  useEffect(() => {
    if (session?.profile?.id) {
      const saved = localStorage.getItem('ethos_card_customizations');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed[session.profile.id]) {
            setCustomizations(parsed[session.profile.id]);
          }
        } catch (e) { }
      }
    }
  }, [session]);

  const springDown = (ref) => {
    if (!ref.current) return;
    ref.current.style.transition = 'transform 0.12s ease-out';
    ref.current.style.transform = 'scale(0.97)';
  };
  const springUp = (ref) => {
    if (!ref.current) return;
    ref.current.style.transition = `transform 0.5s ${LIQUID}`;
    ref.current.style.transform = 'scale(1)';
  };

  if (loading) return <Loader />;

  const profile = session?.profile;
  const firstName = profile?.name?.split(' ')[0] || 'there';
  const upNext = schedule[0];

  return (
    <div className="page-enter" style={{ height: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div
        ref={heroRef}
        style={{
          background: 'var(--hero)',
          color: 'var(--text)',
          padding: 'max(16px, env(safe-area-inset-top)) 16px 32px',
          boxShadow: '0 4px 20px rgba(65, 52, 41, 0.15)',
          transformOrigin: 'top center',
          willChange: 'transform, opacity',
        }}
      >
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar src={profile?.avatar} name={profile?.name} size={52} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 24, margin: 0, color: 'var(--g)', letterSpacing: '-0.02em' }}>
                Hey, {firstName}!
              </h1>
              <p style={{ fontFamily: 'var(--fb)', fontSize: 13, opacity: 0.9, marginTop: 2, color: 'var(--sub)', fontWeight: 500 }}>
                Welcome to The Circular Economy Conference
              </p>
            </div>
            <img src="/assets/ethos-logo-insignia.png" alt="" style={{ width: 44, height: 44, objectFit: 'contain' }} />
          </div>

          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <AdminSwitch initialMode="app" />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                signOut({ redirect: true, callbackUrl: '/login' });
              }}
              className="signout-btn bubble-click"
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 14, padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                color: 'var(--g)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                transition: 'all 0.4s var(--liquid)',
              }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 120 }}>
        {/* COMPREHENSIVE ONBOARDING PROMPT */}
        {profile && (profile.liability !== true || profile.card_made === false || profile.checked_in !== true) && (
          <Link 
            href="/app/my-card"
            className="bottom-stagger"
            style={{ 
              textDecoration: 'none',
              background: 'linear-gradient(135deg, var(--g) 0%, #4a6d2f 100%)',
              borderRadius: 24, padding: '24px', color: '#fff',
              display: 'flex', alignItems: 'center', gap: 20,
              boxShadow: '0 12px 32px rgba(62, 92, 38, 0.25)',
              position: 'relative', overflow: 'hidden',
              animation: 'fadeUp 0.6s var(--liquid) 0.2s both'
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <ShieldCheck size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: 'var(--fh)', fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>
                 Complete Your Setup
              </h2>
              <p style={{ fontFamily: 'var(--fb)', fontSize: 13, opacity: 0.9, fontWeight: 500, margin: 0 }}>
                {profile.liability !== true ? "Sign the liability waiver to start." : 
                 profile.card_made === false ? "Create your digital card for networking." : 
                 "Check in at the desk to join the event."}
              </p>
            </div>
            <ChevronRight size={24} style={{ opacity: 0.8 }} />
            
            {/* Subtle background decoration */}
            <div style={{
              position: 'absolute', right: -20, top: -20, width: 100, height: 100,
              background: 'rgba(255,255,255,0.05)', borderRadius: '50%'
            }} />
          </Link>
        )}

        {typeof window !== 'undefined' && 'Notification' in window && notifPermission === 'default' && (
          <div style={{
            background: 'var(--accent)', color: 'var(--text)', borderRadius: 16, padding: '16px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)', 
            animation: showSuccess ? 'notifExit 0.5s var(--liquid-slow) forwards' : 'fadeUp 0.5s ease both',
            transition: 'all 0.5s var(--liquid-slow)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Bell size={20} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>Enable Notifications</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, opacity: 0.9 }}>Get alerted about announcements & updates.</p>
              </div>
            </div>
            <button
              onClick={() => { 
                Notification.requestPermission().then((p) => {
                  if (p === 'granted') {
                    setShowSuccess(true);
                    setTimeout(() => window.location.reload(), 2600);
                  } else {
                    window.location.reload();
                  }
                }); 
              }}
              className="bubble-click"
              style={{
                background: 'var(--text)', color: 'var(--white)', border: 'none', borderRadius: 8,
                padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.4s var(--liquid)',
              }}
            >
              Turn On
            </button>
          </div>
        )}

        {showSuccess && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 100000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            pointerEvents: 'none',
          }}>
            <div style={{
              textAlign: 'center', animation: 'successPop 0.8s var(--liquid) both',
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: 40, background: 'var(--g)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', color: '#fff', boxShadow: '0 12px 30px rgba(62, 92, 38, 0.3)',
              }}>
                <Bell size={40} />
              </div>
              <h2 style={{ fontFamily: 'var(--fh)', fontSize: 24, fontWeight: 800, color: 'var(--g)', margin: 0 }}>
                Notifications Enabled!
              </h2>
              <p style={{ fontFamily: 'var(--fb)', fontSize: 16, color: 'var(--sub)', marginTop: 8, fontWeight: 600 }}>
                You're all set! 🥳
              </p>
              
              {/* Simple CSS Particles */}
              {[...Array(12)].map((_, i) => (
                <div key={i} style={{
                  position: 'absolute', top: '40%', left: '50%',
                  width: 8, height: 8, borderRadius: '50%',
                  background: i % 2 === 0 ? 'var(--accent)' : 'var(--g)',
                  '--tx': `${(Math.cos(i * 30 * Math.PI / 180) * 100)}px`,
                  '--ty': `${(Math.sin(i * 30 * Math.PI / 180) * 100)}px`,
                  animation: 'particleBurst 1s ease-out both',
                  animationDelay: '0.2s',
                }} />
              ))}
            </div>
          </div>
        )}

        {upNext && (
          <div className="bottom-stagger">
            <p className="section-label">UP NEXT</p>
            <div style={{ background: 'var(--gl)', border: '1px solid var(--gb)', borderRadius: 'var(--r)', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{upNext.title}</h3>
                  <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--sub)', marginTop: 4 }}>{upNext.description}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--fb)', background: 'var(--gl)', border: '1px solid var(--gb)', color: 'var(--g)', padding: '4px 10px', borderRadius: 20, flexShrink: 0 }}>
                  {upNext.start_time}
                </span>
              </div>
              {upNext.location && (
                <div style={{ marginTop: 10, color: 'var(--sub)' }}>
                  <span style={{ fontFamily: 'var(--fb)', fontSize: 12 }}>{upNext.location}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {announcements.length > 0 && (
          <div className="bottom-stagger">
            <p className="section-label">ANNOUNCEMENTS</p>
            <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {announcements.map((a, i) => <AnnouncementCard key={a.id} a={a} index={i} />)}
            </div>
          </div>
        )}

        <div className="bottom-stagger" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p className="section-label" style={{ margin: 0 }}>MY CARD</p>
          <Link
            href="/app/my-card"
            style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', width: '100%' }}
            onPointerDown={() => springDown(cardPreviewRef)}
            onPointerUp={() => springUp(cardPreviewRef)}
            onPointerLeave={() => springUp(cardPreviewRef)}
          >
            <div
              ref={cardPreviewRef}
              style={{
                transformOrigin: 'top center',
                transform: 'scale(calc((100vw - 32px) / 320))',
                width: 320, height: 152,
                transition: `transform 0.4s ${LIQUID}`,
              }}
            >
              <CardPreview user={profile || {}} style={customizations || undefined} />
            </div>
          </Link>
        </div>

        <div className="bottom-stagger">
          <p className="section-label">WORKSPACE</p>
          <Link
            href="/app/notes"
            ref={notesCardRef}
            onPointerDown={() => springDown(notesCardRef)}
            onPointerUp={() => springUp(notesCardRef)}
            onPointerLeave={() => springUp(notesCardRef)}
            style={{
              background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: 24,
              display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
              transform: 'scale(1)', transition: `transform 0.4s ${LIQUID}`, WebkitTapHighlightColor: 'transparent',
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--s1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--g)' }}>
              <FileText size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 16, color: 'var(--text)', margin: 0 }}>Capture Notes</h3>
              <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--sub)', margin: '4px 0 0 0' }}>Jot down insights from your current session.</p>
            </div>
            <ChevronRight color="var(--muted)" />
          </Link>
        </div>
      </div>

    </div>
  );
}
