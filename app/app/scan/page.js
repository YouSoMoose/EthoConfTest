'use client';

import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import QRScanner from '@/components/QRScanner';

export default function ScanPage() {
  const router = useRouter();

  return (
    <div className="page-enter">
      <Topbar title="📷 Scan QR" onBack={() => router.back()} />
      <QRScanner />
    </div>
  );
}
