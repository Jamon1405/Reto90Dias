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
    window.dispatchEvent(new Event('userchange'));
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
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'linear-gradient(90deg, #0288d1, #26c6da)',
  padding: '12px 20px',
  borderRadius: '0 0 10px 10px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  marginBottom: '30px',
};

// Estilos para los enlaces
const linkStyle = {
  color: '#fff',
  textDecoration: 'none',
  fontSize: '18px',
  cursor: 'pointer',
  fontWeight: 600,
  padding: '0 10px',
};

const selectStyle = {
  padding: '6px',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: '#fff',
};
