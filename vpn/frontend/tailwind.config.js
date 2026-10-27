/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#090d16',
          900: '#0f172a',
          850: '#151f32',
          800: '#1e293b',
          700: '#334155',
        },
        cyber: {
          emerald: '#10b981',
          cyan: '#06b6d4',
          blue: '#3b82f6',
          violet: '#8b5cf6',
          rose: '#f43f5e',
          amber: '#f59e0b',
        }
      }
    },
  },
  plugins: [],
}
