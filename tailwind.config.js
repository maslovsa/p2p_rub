/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0f0f1a',
        card: '#1a1a2e',
        'card-hover': '#22223a',
        border: '#2a2a4a',
        accent: '#7c3aed',
        'accent-light': '#a78bfa',
        green: '#22c55e',
        red: '#ef4444',
        yellow: '#eab308',
        muted: '#94a3b8',
      },
    },
  },
  plugins: [],
}
