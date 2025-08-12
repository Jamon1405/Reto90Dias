import styles from './Infraestructura.module.css';

export default function Infraestructura() {
  return (
    <section id="infraestructura" className={styles.section}>
      <h2 className={styles.title}>Infraestructura</h2>
      <h3 className={styles.subtitle}>Estudios y Foros</h3>
      <ul className={styles.list}>
        <li>EGGM Argos</li>
        <li>7 Digital</li>
        <li>UC Roma</li>
        <li>Audio Pent House</li>
      </ul>
      <h3 className={styles.subtitle}>Tecnología</h3>
      <ul className={styles.list}>
        <li>Pantallas LED de gran formato</li>
        <li>Equipos de producción y postproducción de última generación</li>
        <li>Capacidad para proyectos en volumen virtual y set real</li>
      </ul>
    </section>
  );
}
