import styles from './EquipoDirectivo.module.css';

export default function EquipoDirectivo() {
  return (
    <section id="equipo-directivo" className={styles.section}>
      <h2 className={styles.title}>Equipo Directivo</h2>
      <ul className={styles.list}>
        <li>
          <strong>Carlos Perezcano</strong> — CEO
        </li>
        <li>
          <strong>Magda Talavera</strong> — Directora Comercial y Productora
        </li>
        <li>
          <strong>Miguel Batz</strong> — Productor Ejecutivo
        </li>
      </ul>
    </section>
  );
}
