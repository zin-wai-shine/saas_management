/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'teal-glass': '#14b8a6',
        'teal-light': '#5eead4',
        'teal-mist': '#99f6e4',
        'forest-dark': '#0f172a',
        'forest-shadow': '#1e293b',
        'cyan-glow': '#e0f2fe',
        'light-bg': '#f8fafc',
        'light-surface': '#ffffff',
        'light-border': '#e2e8f0',
        'light-text': '#1e293b',
        'light-text-secondary': '#64748b',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'large': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
