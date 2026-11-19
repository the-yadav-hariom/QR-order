/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0F0F0F',
        darkCard: '#1A1A1A',
        darkCard2: '#212121',
        darkLine: '#2A2A2A',
        brandOrange: '#F25C2A',
        brandOrangeHover: '#ff7a47',
        brandGreen: '#22C55E',
        brandAmber: '#F5A524',
        brandRed: '#EF4444',
        brandBlue: '#5B7CFF',
        creamBg: '#FAF8F5',
        inkText: '#1A1A1A',
        inkMuted: '#6B655E',
        guestLine: '#EAE4DC'
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        pulseDot: 'pl 2s infinite',
        glowRing: 'glow 1.6s infinite',
        bigPulse: 'pulseCustom 2s infinite',
        shakeBox: 'shk 0.4s',
        stampIn: 'stamp 0.5s 0.5s both',
        receiptIn: 'rin 0.6s cubic-bezier(0.2, 0.9, 0.3, 1.2)',
      },
      keyframes: {
        pl: {
          '70%': { boxShadow: '0 0 0 7px rgba(34,197,94,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(34,197,94,0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 0 0 rgba(242,92,42,0.5)' },
          '100%': { boxShadow: '0 0 0 10px rgba(242,92,42,0)' },
        },
        pulseCustom: {
          '0%': { boxShadow: '0 0 0 0 rgba(242,92,42,0.45)' },
          '100%': { boxShadow: '0 0 0 34px rgba(242,92,42,0)' },
        },
        shk: {
          '20%, 60%': { transform: 'translateX(-9px)' },
          '40%, 80%': { transform: 'translateX(9px)' },
        },
        stamp: {
          from: { transform: 'rotate(-12deg) scale(2.4)', opacity: '0' },
          to: { transform: 'rotate(-12deg) scale(1)', opacity: '1' },
        },
        rin: {
          from: { transform: 'translateY(-30px) scaleY(0.7)', opacity: '0' },
          to: { transform: 'translateY(0) scaleY(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
