import './globals.css';
import Navigation from '../components/Navigation'; // Barra de navegación

export const metadata = {
  title: 'JamFit - Programa de 60 días',
  description: 'Tu programa de entrenamiento de 60 días',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body>
        <Navigation /> {/* Navegación */}
        {children}      {/* Aquí se renderizan las páginas */}
      </body>
    </html>
  );
}
