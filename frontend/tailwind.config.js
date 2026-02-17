/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css}",
  ],
  theme: {
    extend: {
      screens: {
        xs: '400px',
      },
      colors: {
        /* Warm cream background */
        cream: {
          DEFAULT: '#F9F7F2',
          50: '#FDFCF9',
          100: '#F9F7F2',
          200: '#F3F0E8',
          300: '#E8E4DA',
        },
        /* Sage green — fresh / positive */
        sage: {
          DEFAULT: '#6BAF92',
          light: '#8BC4A8',
          dark: '#559278',
        },
        /* Tomato red — expiring / urgent */
        tomato: {
          DEFAULT: '#E4572E',
          light: '#EA7A5A',
          dark: '#C94A24',
        },
        /* Soft amber — warning / medium */
        amber: {
          DEFAULT: '#F4A261',
          light: '#F7B882',
          dark: '#E08E4A',
        },
        /* Text */
        ink: {
          DEFAULT: '#1E1E1E',
          light: '#4A4A4A',
          muted: '#6B6B6B',
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
        soft: '0 2px 16px rgba(30, 30, 30, 0.06)',
        'soft-lg': '0 8px 32px rgba(30, 30, 30, 0.08)',
        'soft-xl': '0 16px 48px rgba(30, 30, 30, 0.1)',
        card: '0 4px 24px rgba(30, 30, 30, 0.06)',
        'card-hover': '0 12px 40px rgba(30, 30, 30, 0.1)',
      },
      transitionDuration: {
        200: '200ms',
        300: '300ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
