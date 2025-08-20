import './globals.css';
import { Manrope, Space_Grotesk } from 'next/font/google';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
  display: 'swap',
});
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-heading',
  display: 'swap',
});

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
        <body className={`${manrope.variable} ${spaceGrotesk.variable}`}>{children}</body>
      </html>
  );
}
