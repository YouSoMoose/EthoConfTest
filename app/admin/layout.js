'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const level = session?.profile?.access_level || 0;

  const tabs = [
    { label: 'Dashboard', href: '/admin', minLevel: 2 },
    { label: 'Check-in', href: '/admin/checkin', minLevel: 2 },
    { label: 'Messages', href: '/admin/messages', minLevel: 2 },
    { label: 'Companies', href: '/admin/companies', minLevel: 2 },
    { label: 'Schedule', href: '/admin/schedule', minLevel: 2 },
    { label: 'Users', href: '/admin/users', minLevel: 3 },
    { label: 'Raffle', href: '/admin/raffle', minLevel: 3 },
  ].filter(tab => level >= tab.minLevel);

  return (
    <div className="min-h-screen">
      <div className="page-header">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌿</span>
            <div>
              <h1 className="font-heading text-lg font-bold">Admin Portal</h1>
              <p className="text-green-200 text-xs font-body">{session?.profile?.name}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-green-200 hover:text-white text-sm font-body transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-amber-200 overflow-x-auto">
        <div className="max-w-4xl mx-auto flex">
          {tabs.map((tab) => {
            const isActive = tab.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-3 text-sm font-body whitespace-nowrap transition-all duration-200 border-b-2 ${
                  isActive
                    ? 'border-green-700 text-green-800 font-bold'
                    : 'border-transparent text-gray-500 hover:text-green-700 hover:border-green-200'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {children}
    </div>
  );
}
