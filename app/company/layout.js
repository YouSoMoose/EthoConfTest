'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function CompanyLayout({ children }) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen">
      <div className="page-header">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌿</span>
            <div>
              <h1 className="font-heading text-lg font-bold">Company Portal</h1>
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
      {children}
    </div>
  );
}
