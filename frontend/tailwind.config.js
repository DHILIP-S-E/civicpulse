/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F5F7FA',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8FAFC',
        },
        primary: {
          DEFAULT: '#1677FF',
          hover: '#0958D9',
          light: '#EAF3FF',
        },
        ink: {
          primary: '#172033',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        border: {
          DEFAULT: '#E2E8F0',
          strong: '#CBD5E1',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEF2F2',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FFFBEB',
        },
        success: {
          DEFAULT: '#16A34A',
          light: '#F0FDF4',
        },
        info: {
          DEFAULT: '#0284C7',
          light: '#F0F9FF',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
