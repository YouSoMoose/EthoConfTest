'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Avatar from '@/components/Avatar';
import Loader from '@/components/Loader';
import RoleChip from '@/components/RoleChip';
import { ACCESS_LABELS } from '@/lib/constants';
import { RefreshCcw, Users, Check, Shield, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(d => { setUsers(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('admin-users-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        console.log('[DEBUG] Users Realtime event:', payload);
        if (payload.eventType === 'INSERT') {
          setUsers(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setUsers(prev => prev.map(u => u.id === payload.new.id ? { ...u, ...payload.new } : u));
        } else if (payload.eventType === 'DELETE') {
          setUsers(prev => prev.filter(u => u.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleUserStatus = async (userId, field, currentVal) => {
    const newVal = !currentVal;
    const res = await fetch('/api/users', { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ id: userId, [field]: newVal }) 
    });
    if (res.ok) {
      const u = await res.json();
      setUsers(p => p.map(x => x.id === userId ? { ...x, [field]: u[field] } : x));
      toast.success(`${field.replace('_', ' ')} updated`);
    } else toast.error('Failed to update status');
  };

  const updateRole = async (userId, newLevel) => {
    const res = await fetch('/api/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: userId, access_level: parseInt(newLevel) }) });
    if (res.ok) {
      const u = await res.json();
      setUsers(p => p.map(x => x.id === userId ? { ...x, access_level: u.access_level } : x));
      toast.success('Updated');
    } else toast.error('Failed');
  };

  const undoCheckin = async (userId) => {
    if (!confirm('Revert check-in status for this user?')) return;
    const res = await fetch(`/api/checkin?user_id=${userId}`, { method: 'DELETE' });
    if (res.ok) {
      setUsers(p => p.map(x => x.id === userId ? { ...x, checked_in: false } : x));
      toast.success('Check-in reverted');
    } else {
      const d = await res.json();
      toast.error(d.error || 'Failed to undo');
    }
  };

  if (loading) return <Loader admin />;

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-enter" style={{ padding: '24px 16px', height: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 22, color: 'var(--atext)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Users size={24} /> Users
        </h2>

        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', background: 'var(--as2)', border: '1px solid var(--aborder)',
            borderRadius: 10, padding: '11px 14px', fontSize: 14,
            fontFamily: 'var(--fb)', color: 'var(--atext)', outline: 'none', marginBottom: 16,
          }}
        />

        {/* Desktop table */}
        <div className="admin-table" style={{
          background: 'var(--as2)', border: '1px solid var(--aborder)', borderRadius: 'var(--r)', overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--fb)', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--as3)' }}>
                {['User', 'Email', 'Liability', 'Card Made', 'Checked In', 'Role'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontFamily: 'var(--fhs)', fontWeight: 600, fontSize: 12, color: 'var(--asub)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderTop: '1px solid var(--aborder)' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar src={u.avatar} name={u.name} size={28} />
                      <span style={{ color: 'var(--atext)', fontWeight: 500 }}>{u.name || 'No name'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--asub)' }}>{u.email}</td>
                  
                  {/* Liability Status */}
                  <td style={{ padding: '12px 14px' }}>
                    <button 
                      onClick={() => toggleUserStatus(u.id, 'liability', u.liability)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                    >
                      <span style={{ color: u.liability ? 'var(--agreen)' : 'var(--amuted)', fontWeight: 600 }}>
                        {u.liability ? <Check size={18} strokeWidth={3} /> : <div style={{ width: 18, height: 18, border: '2px solid var(--aborder)', borderRadius: 4 }} />}
                      </span>
                    </button>
                  </td>

                  {/* Card Made Status */}
                  <td style={{ padding: '12px 14px' }}>
                    <button 
                      onClick={() => toggleUserStatus(u.id, 'card_made', u.card_made)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                    >
                      <span style={{ color: u.card_made ? 'var(--agreen)' : 'var(--amuted)', fontWeight: 600 }}>
                        {u.card_made ? <Check size={18} strokeWidth={3} /> : <div style={{ width: 18, height: 18, border: '2px solid var(--aborder)', borderRadius: 4 }} />}
                      </span>
                    </button>
                  </td>

                  {/* Checked In Status */}
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button 
                        onClick={() => toggleUserStatus(u.id, 'checked_in', u.checked_in)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                      >
                        <span style={{ color: u.checked_in ? 'var(--agreen)' : 'var(--amuted)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                          {u.checked_in ? <Check size={18} strokeWidth={3} /> : <div style={{ width: 18, height: 18, border: '2px solid var(--aborder)', borderRadius: 4 }} />}
                        </span>
                      </button>
                    </div>
                  </td>

                  <td style={{ padding: '12px 14px' }}>
                    <select
                      value={u.access_level}
                      onChange={e => updateRole(u.id, e.target.value)}
                      style={{
                        background: 'var(--as3)', border: '1px solid var(--aborder)',
                        borderRadius: 8, padding: '4px 8px', fontSize: 12,
                        fontFamily: 'var(--fb)', color: 'var(--atext)', outline: 'none',
                      }}
                    >
                      <option value={0}>Attendee</option>
                      <option value={1}>Company</option>
                      <option value={2}>Staff</option>
                      <option value={3}>Super Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="admin-cards stagger">
          {filtered.map(u => (
            <div key={u.id} style={{
              background: 'var(--as2)', border: '1px solid var(--aborder)', borderRadius: 'var(--r)',
              padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16,
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Avatar src={u.avatar} name={u.name} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 15, color: 'var(--atext)', margin: 0 }}>{u.name || 'No name'}</h3>
                  <p style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--amuted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                gap: 12,
                paddingTop: 12,
                borderTop: '1px solid var(--aborder)',
              }}>
                {/* Status Toggles */}
                <div style={{ display: 'flex', gap: 14, background: 'var(--as3)', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--aborder)' }}>
                  <button 
                    onClick={() => toggleUserStatus(u.id, 'liability', u.liability)}
                    title="Liability"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: u.liability ? 'var(--agreen)' : 'var(--amuted)' }}
                  >
                    <Shield size={16} fill={u.liability ? 'var(--agreen)' : 'none'} />
                  </button>
                  <button 
                    onClick={() => toggleUserStatus(u.id, 'card_made', u.card_made)}
                    title="Card Made"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: u.card_made ? 'var(--agreen)' : 'var(--amuted)' }}
                  >
                    <User size={16} fill={u.card_made ? 'var(--agreen)' : 'none'} />
                  </button>
                  <button 
                    onClick={() => toggleUserStatus(u.id, 'checked_in', u.checked_in)}
                    title="Checked In"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: u.checked_in ? 'var(--agreen)' : 'var(--amuted)' }}
                  >
                    <Check size={16} strokeWidth={3} />
                  </button>
                </div>

                <select
                  value={u.access_level}
                  onChange={e => updateRole(u.id, e.target.value)}
                  style={{
                    background: 'var(--as3)', border: '1px solid var(--aborder)',
                    borderRadius: 8, padding: '6px 10px', fontSize: 12,
                    fontFamily: 'var(--fb)', color: 'var(--atext)', outline: 'none',
                    minWidth: 100,
                  }}
                >
                  <option value={0}>Attendee</option>
                  <option value={1}>Company</option>
                  <option value={2}>Staff</option>
                  <option value={3}>Super Admin</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
