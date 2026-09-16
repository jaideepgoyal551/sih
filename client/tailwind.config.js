/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: '#0F172A',
                accent: '#1D4ED8',
                soft: '#E2E8F0'
            }
        }
    },
    plugins: []
};
