import Link from 'next/link';

export default function Navigation() {
  return (
    <nav style={navStyle}>
      <Link href="/" style={linkStyle}>
        Inicio
      </Link>
      <Link href="/servicios-de-produccion" style={linkStyle}>
        Servicios de Producción
      </Link>
      <Link href="/contenido-original" style={linkStyle}>
        Contenido Original
      </Link>
      <Link href="/virtual-production" style={linkStyle}>
        Virtual Production
      </Link>
      <Link href="/nosotros" style={linkStyle}>
        Nosotros
      </Link>
      <Link href="/contacto" style={linkStyle}>
        Contacto
      </Link>
    </nav>
  );
}

// Estilos para la barra de navegación
const navStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  backgroundColor: '#333',
  padding: '10px',
  borderBottom: '2px solid #0288d1',
  marginBottom: '20px',
};

// Estilos para los enlaces
const linkStyle = {
  color: '#fff',
  textDecoration: 'none',
  fontSize: '18px',
  cursor: 'pointer',
};
