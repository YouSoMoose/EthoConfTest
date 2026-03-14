'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Avatar from '@/components/Avatar';
import Loader from '@/components/Loader';
import { ACCESS_LABELS, ACCESS_COLORS } from '@/lib/constants';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => { setUsers(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const updateRole = async (userId, newLevel) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, access_level: parseInt(newLevel) }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, access_level: updated.access_level } : u));
        toast.success('Role updated');
      } else {
        toast.error('Failed to update');
      }
    } catch {
      toast.error('Network error');
    }
  };

  if (loading) return <Loader />;

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-enter">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="font-heading text-2xl font-bold text-green-900 mb-6">👥 Users</h2>

        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field mb-6"
        />

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="bg-green-50">
                  <th className="text-left p-3 font-heading font-bold text-green-900">User</th>
                  <th className="text-left p-3 font-heading font-bold text-green-900">Email</th>
                  <th className="text-center p-3 font-heading font-bold text-green-900">Checked In</th>
                  <th className="text-center p-3 font-heading font-bold text-green-900">Role</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} className="border-t border-amber-100 hover:bg-amber-50/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar src={user.avatar} name={user.name} size={32} />
                        <span className="font-medium text-green-900">{user.name || 'No name'}</span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-500">{user.email}</td>
                    <td className="p-3 text-center">
                      {user.checked_in ? (
                        <span className="text-green-600 font-bold">✅</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <select
                        value={user.access_level}
                        onChange={e => updateRole(user.id, e.target.value)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold border-0 ${ACCESS_COLORS[user.access_level] || ''}`}
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
        </div>
      </div>
    </div>
  );
}
