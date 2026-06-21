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
            50: '#f5f3ff',
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
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            205: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            450: '#94a3b8',
            455: '#64748b',
            500: '#64748b',
            600: '#475569',
            650: '#475569',
            655: '#334155',
            700: '#334155',
            750: '#1e293b',
            800: '#1e293b',
            850: '#0f172a',
            855: '#0f172a',
            900: '#0f172a',
            950: '#020617',
            955: '#020617',
          },
          booking: {
            blue: '#334155',
            lightblue: '#788896',
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
  