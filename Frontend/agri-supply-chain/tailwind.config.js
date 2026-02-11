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
        primary: {
          DEFAULT: '#14522d',
          hover: '#0f3e22',
          light: '#1a6b3a',
        },
        background: {
          light: '#f6f8f7',
          dark: '#131f18',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#1c2b23',
        },
        border: '#e5e7eb',
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}
