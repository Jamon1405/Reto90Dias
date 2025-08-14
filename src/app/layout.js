import './globals.css';
import Navigation from '../components/Navigation'; // Barra de navegación

export const metadata = {
  title: 'Reto 90 Días',
  description: 'Servicios de Producción y Contenido Original',
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
