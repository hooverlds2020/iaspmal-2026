/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta oficial extraída del Logotipo IASPM 2026
        iaspm: {
          blue: '#002E5D',      // Azul Oscuro (Logo "CONGRESO")
          orange: '#F58A55',    // Naranja (Texto "Ética, política...")
          lightblue: '#005580', // Azul Medio (Detalles)
          bg: '#F8FAFC',        // Fondo web (Gris muy sutil)
        }
      },
      fontFamily: {
        // Tipografía principal para todo el sitio
        sans: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
