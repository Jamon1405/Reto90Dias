import './globals.css';
import { Poppins } from 'next/font/google';
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600'] });

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
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
