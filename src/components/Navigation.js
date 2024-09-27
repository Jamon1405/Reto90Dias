import Link from 'next/link';

export default function Navigation() {
  return (
    <nav style={navStyle}>
      <Link href="/" style={linkStyle}>
        Inicio
      </Link>
      <Link href="/calendar" style={linkStyle}>
        Calendario
      </Link>
      <Link href="/weight" style={linkStyle}>
        Peso
      </Link>
      <Link href="/diet" style={linkStyle}>
        Dieta
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
