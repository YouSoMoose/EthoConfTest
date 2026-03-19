export const metadata = {
  title: 'Carbon Game',
  description: 'Standalone Carbon Game — runs in Next but isolated from app UI',
};

export default function CarbonGameLayout({ children }) {
  // minimal wrapper to avoid root app providers and banners
  return (
    <div style={{ minHeight: '100vh', background: '#f6f9fb', color: '#0b1221', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {children}
    </div>
  );
}
