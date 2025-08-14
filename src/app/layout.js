import './globals.css';
import Navigation from '../components/Navigation';

export const metadata = {
  title: 'Reto90Dias',
  description: 'Servicios de producción y contenido original',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
