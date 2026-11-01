/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ground: '#0B0F19',
        surface: '#111827',
        raised: '#1F2937',
        card: '#111827',
        border: 'rgba(148, 163, 184, 0.15)',
        rule: 'rgba(148, 163, 184, 0.12)',
        terminal: {
          border: 'rgba(148, 163, 184, 0.15)',
          control: '#1F2937',
          muted: '#94A3B8',
          subtle: '#64748B',
        },
        hazard: {
          critical: '#EF4444',
          moderate: '#F59E0B',
          resolved: '#10B981',
        },
        telemetry: '#3B82F6',
        accent: '#3B82F6',
        interactive: '#3B82F6',
        safe: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
