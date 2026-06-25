/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#0f172a',
        'bg-card': 'rgba(30, 41, 59, 0.7)',
        'accent-cyan': '#22d3ee',
        'accent-purple': '#818cf8',
      }
    },
  },
  plugins: [],
}
