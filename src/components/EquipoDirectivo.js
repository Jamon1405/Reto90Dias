import styles from './EquipoDirectivo.module.css';

export default function EquipoDirectivo() {
  return (
    <section id="equipo-directivo" className={styles.section}>
      <h2 className={styles.title}>Equipo Directivo</h2>
      <div className={styles.content}>
        <img src="https://via.placeholder.com/800x400?text=Equipo+Directivo" alt="Equipo directivo" />
        <p>
          Nuestro liderazgo combina visión creativa y experiencia en gestión de
          proyectos para impulsar cada producción al máximo.
        </p>
      </div>
    </section>
  );
}
