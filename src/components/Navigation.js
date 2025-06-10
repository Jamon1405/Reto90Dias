'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navigation() {
  const [user, setUser] = useState('ximena');
  const [menuOpen, setMenuOpen] = useState(false);

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

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <nav className="navbar">
      <button className="menu-toggle" onClick={toggleMenu} aria-label="Abrir menú">
        &#9776;
      </button>
      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <Link href="/" className="nav-link" onClick={() => setMenuOpen(false)}>
          Inicio
        </Link>
        <Link href="/calendar" className="nav-link" onClick={() => setMenuOpen(false)}>
          Calendario
        </Link>
        <Link href="/weight" className="nav-link" onClick={() => setMenuOpen(false)}>
          Peso
        </Link>
        <Link href="/diet" className="nav-link" onClick={() => setMenuOpen(false)}>
          Dieta
        </Link>
        <Link href="/routine" className="nav-link" onClick={() => setMenuOpen(false)}>
          Rutinas
        </Link>
      </div>
      <select value={user} onChange={handleChange} className="user-select">
        <option value="ximena">Ximena</option>
        <option value="antonio">Antonio</option>
      </select>
    </nav>
  );
}
