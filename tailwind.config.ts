import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-manrope)', 'Manrope', 'system-ui', 'sans-serif']
      },
      colors: {
        midnight: '#050505',
        charcoal: '#0B0B0B',
        violetAura: '#A78BFA',
        cyanWhisper: '#7DD3FC'
      },
      backgroundImage: {
        'nocturne-gradient': 'linear-gradient(180deg, #000000 0%, #050505 50%, #0A0A0A 100%)'
      },
      boxShadow: {
        aurora: '0 0 40px rgba(167, 139, 250, 0.2)',
        pulse: '0 0 30px rgba(125, 211, 252, 0.35)'
      }
    }
  },
  plugins: []
};

export default config;

