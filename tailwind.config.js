/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'ethos': {
            'purple': '#6366f1',
            'purple-dark': '#4f46e5',
            'purple-light': '#818cf8',
            'cyan': '#06b6d4',
            'cyan-dark': '#0891b2',
            'cyan-light': '#22d3ee',
          }
        },
        backgroundImage: {
          'ethos-gradient': 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
          'ethos-gradient-dark': 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)',
        }
      },
    },
    plugins: [],
  }