import './globals.css';
import Navigation from '../components/Navigation'; // Barra de navegación

export const metadata = {
  title: 'JamFit - Programa de 90 días',
  description: 'Tu programa de entrenamiento de 90 días',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Navigation /> {/* Navegación */}
        {children}      {/* Aquí se renderizan las páginas */}
      </body>
    </html>
  );
}
