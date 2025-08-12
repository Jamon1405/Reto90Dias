import styles from './ProduccionesDestacadas.module.css';

export default function ProduccionesDestacadas() {
  return (
    <section id="producciones-destacadas" className={styles.section}>
      <h2 className={styles.title}>Producciones destacadas</h2>
      <ul className={styles.list}>
        <li>“El Reto de Creadores” — YouTube Originals</li>
        <li>“Mamá ya es mi Casa” — TelevisaUnivision</li>
        <li>“El Secreto” — Serie vertical original de Light Channel</li>
        <li>“Tengo Talento, Mucho Talento” — Estrella TV</li>
        <li>“Alarma TV” — Estrella TV</li>
      </ul>
    </section>
  );
}
