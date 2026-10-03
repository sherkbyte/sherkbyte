import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07111F', panel: '#0B1B30', line: '#173254',
        cobalt: '#2F6BFF', cyan: { 400: '#22D3EE' }, ok: '#34D399', gold: '#C9A227'
      },
      keyframes: { rise: { '0%': { opacity: '0', transform: 'translateY(14px)' }, '100%': { opacity: '1', transform: 'none' } } },
      animation: { rise: 'rise .7s ease-out both' }
    }
  },
  plugins: []
};
export default config;
