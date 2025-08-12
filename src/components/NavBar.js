import Link from 'next/link';
import styles from './NavBar.module.css';

export default function NavBar() {
  return (
    <nav className={styles.nav}>
      <Link href="/">Inicio</Link>
      <Link href="/quienes-somos">Quiénes somos</Link>
      <Link href="/core-business">Core Business</Link>
      <Link href="/infraestructura">Infraestructura</Link>
      <Link href="/producciones-destacadas">Producciones destacadas</Link>
      <Link href="/propuesta-valor">Propuesta de valor</Link>
      <Link href="/equipo-directivo">Equipo Directivo</Link>
      <Link href="/contacto">Contacto</Link>
    </nav>
  );
}
