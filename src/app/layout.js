import './globals.css';
import { Montserrat } from 'next/font/google';
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '700'] });

export const metadata = {
  title: 'Light Channel',
  description: 'Producción audiovisual inspirada en colorfilms.mx',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={montserrat.className}>{children}</body>
    </html>
  );
}
