import NavBar from '@/components/NavBar';

export default function EsLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <NavBar lang="es" />
        <main>{children}</main>
      </body>
    </html>
  );
}
