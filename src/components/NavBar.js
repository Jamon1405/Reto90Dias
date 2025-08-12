import styles from './NavBar.module.css';

export default function NavBar() {
  return (
    <nav className={styles.nav}>
      <a href="#quienes-somos">Quiénes somos</a>
      <a href="#core-business">Core Business</a>
      <a href="#infraestructura">Infraestructura</a>
      <a href="#producciones-destacadas">Producciones destacadas</a>
      <a href="#propuesta-valor">Propuesta de valor</a>
      <a href="#equipo-directivo">Equipo Directivo</a>
      <a href="#contacto">Contacto</a>
    </nav>
  );
}
