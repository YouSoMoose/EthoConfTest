import BottomNav from '@/components/BottomNav';

export default function AttendeeLayout({ children }) {
  return (
    <div className="min-h-screen pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
