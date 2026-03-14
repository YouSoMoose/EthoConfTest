/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'slide-right': 'slideInRight 0.4s ease-out forwards',
        'slide-left': 'slideInLeft 0.4s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'stamp-bounce': 'stampBounce 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};
