module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: 'class',
  theme: {
    fontFamily: {
      sans: ['Lato', 'Inter', 'system-ui', 'sans-serif'],
      display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
    },
    extend: {
      colors: {
        primary: {
          50: '#F5F5DC',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        gray: {
          55: '#f9f9fb', // preserve old white-gray as 55 if needed
          50: '#f4f0e6', // beige background
          100: '#f3f3f5',
          200: '#e4e4e7',
          205: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          450: '#a1a1aa',
          455: '#71717a',
          500: '#71717a',
          600: '#52525b',
          650: '#52525b',
          655: '#3f3f46',
          700: '#3f3f46',
          750: '#27272a',
          800: '#27272a',
          850: '#18181b',
          855: '#18181b',
          900: '#18181b',
          950: '#09090b',
          955: '#09090b',
        },
        booking: {
          blue: '#2d2d30',
          lightblue: '#008cff',
          orange: '#ff5e36',
          yellow: '#ff9900',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
      }
    }
  },
  plugins: []
};
