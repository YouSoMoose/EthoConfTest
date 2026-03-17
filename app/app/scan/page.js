import { Scan } from 'lucide-react';

export default function ScanPage() {
  const router = useRouter();

  return (
    <div className="page-enter">
      <Topbar title="Scan QR" onBack={() => router.back()} />
      <QRScanner />
    </div>
  );
}
