'use client';

export default function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)' }}>
      <div className="flex flex-col items-center gap-4 animate-fade-up">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-green-700 animate-spin"></div>
          <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-b-amber-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <p className="text-sm text-gray-400 font-body">Loading...</p>
      </div>
    </div>
  );
}
