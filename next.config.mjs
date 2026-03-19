/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  async rewrites() {
    return [
      // Serve the static game's index.html when visiting /carbon-game
      { source: '/carbon-game', destination: '/carbon-game/index.html' },
      { source: '/carbon-game/', destination: '/carbon-game/index.html' }
    ];
  },
};

export default nextConfig;
