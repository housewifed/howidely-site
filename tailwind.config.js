/** Tailwind theme for the Howidely site.
 *
 *  `content` must include src/app.js — a lot of utility classes are assembled
 *  in JS strings (map pins, status chips, enrollment steps). If you drop it,
 *  those classes get tree-shaken out and elements render unstyled.
 */
module.exports = {
  content: ['./src/index.html', './src/app.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      colors: {
        ink: { 950: '#020617', 900: '#0b1120', 850: '#0f172a', 800: '#131c31' },
        // Dimmest slate that still clears WCAG AA (4.5:1) on the darkest panel
        // background used for small text. Do not darken this without re-checking
        // contrast — see docs/market-audit.md.
        muted: '#778495'
      },
      keyframes: {
        pulseRing: { '0%': { transform: 'scale(0.6)', opacity: '0.9' }, '100%': { transform: 'scale(2.4)', opacity: '0' } },
        sweep:     { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
        floaty:    { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } }
      },
      animation: {
        pulseRing: 'pulseRing 2.4s ease-out infinite',
        sweep: 'sweep 6s linear infinite',
        floaty: 'floaty 7s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
