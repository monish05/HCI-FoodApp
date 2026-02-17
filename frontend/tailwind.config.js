/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FDF8F3',
          50: '#FFFCF9',
          100: '#FDF8F3',
          200: '#F9F0E6',
          300: '#F0E4D4',
        },
        sage: {
          DEFAULT: '#87A878',
          light: '#A8C49A',
          dark: '#6B8E5D',
        },
        tomato: {
          DEFAULT: '#E07A5F',
          light: '#E89A85',
          dark: '#C45D42',
        },
        carrot: {
          DEFAULT: '#E8A75B',
          light: '#F0C078',
          dark: '#D4913D',
        },
        amber: {
          soft: '#E8C547',
          warm: '#D4A84B',
        },
        ink: {
          DEFAULT: '#2D3142',
          light: '#4F5466',
          muted: '#6B7280',
        },
      },
      fontFamily: {
        display: ['DM Sans', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 2px 12px rgba(45, 49, 66, 0.06)',
        'soft-lg': '0 8px 24px rgba(45, 49, 66, 0.08)',
        warm: '0 4px 20px rgba(232, 167, 91, 0.12)',
      },
      transitionDuration: {
        200: '200ms',
      },
    },
  },
  plugins: [],
}
