/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        neutral: {
          subtle: 'var(--border-neutral-subtle)',
          container: 'var(--background-neutral-container)',
        }
      },
      spacing: {
        '50': 'var(--size-50)',
        '100': 'var(--size-100)',
        '150': 'var(--size-150)',
        '200': 'var(--size-200)',
        '300': 'var(--size-300)',
        '400': 'var(--size-400)',
      }
    },
  },
  plugins: [],
}
