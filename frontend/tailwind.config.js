/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ground: '#0e0e11',
        surface: '#131217',
        raised: '#1a1a1f',
        rule: '#1b1a1f',
        terminal: {
          border: '#222226',
          control: '#2b2b30',
          muted: '#8a8c92',
          subtle: '#52525b',
        },
        hazard: {
          critical: '#e5566f',
          moderate: '#d9a441',
          resolved: '#44a282',
        },
        telemetry: '#4a8ad6',
        accent: '#4a8ad6',
      },
      fontFamily: {
        sans: ['"Public Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
