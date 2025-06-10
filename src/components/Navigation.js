'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navigation() {
  const [user, setUser] = useState('ximena');

  useEffect(() => {
    const stored = localStorage.getItem('selectedUser');
    if (stored) {
      setUser(stored);
    }
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setUser(value);
    localStorage.setItem('selectedUser', value);
  };

  return (
    <nav style={navStyle}>
      <div style={{ display: 'flex', gap: '15px' }}>
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
        <Link href="/routine" style={linkStyle}>
          Rutinas
        </Link>
      </div>
      <select value={user} onChange={handleChange} style={selectStyle}>
        <option value="ximena">Ximena</option>
        <option value="antonio">Antonio</option>
      </select>
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

const selectStyle = {
  padding: '6px',
  borderRadius: '4px',
};
