/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        panel: {
          primary: 'rgba(15, 23, 42, 0.94)',
          secondary: '#111827',
        },
        border: {
          subtle: 'rgba(148, 163, 184, 0.18)',
        },
        hazard: {
          critical: '#EF4444',
          moderate: '#F59E0B',
          resolved: '#10B981',
        },
        telemetry: '#06B6D4',
        accent: '#60A5FA',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}

