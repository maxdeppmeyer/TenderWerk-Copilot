/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#13262f',
        brand: {
          50: '#eefaf8',
          100: '#d7f3ef',
          500: '#137b70',
          600: '#0f675e',
          700: '#0e544e',
          900: '#092f2d'
        }
      },
      boxShadow: { soft: '0 14px 34px rgba(15, 41, 49, 0.08)' }
    }
  },
  plugins: []
}
