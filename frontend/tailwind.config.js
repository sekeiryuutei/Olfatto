/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0D0D0F',
        'bg-secondary': '#141416',
        surface: '#1B1B1F',
        'surface-elevated': '#222228',
        primary: { DEFAULT: '#D4AF37', soft: '#E6C75A' },
        'text-primary': '#F5F5F5',
        'text-secondary': '#A4A4AA',
        'text-muted': '#6F7078',
        border: '#2A2A30',
        success: '#2ECC71',
        warning: '#F39C12',
        danger: '#E74C3C',
        info: '#3498DB',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'serif'],
      },
      borderRadius: {
        card: '18px',
        button: '12px',
        sm: '8px',
      },
      spacing: {
        4.5: '18px',
      },
    },
  },
  plugins: [],
};
