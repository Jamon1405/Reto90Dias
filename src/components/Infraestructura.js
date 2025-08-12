import styles from './Infraestructura.module.css';

export default function Infraestructura() {
  return (
    <section id="infraestructura" className={styles.section}>
      <h2 className={styles.title}>Infraestructura</h2>
      <div className={styles.content}>
        <img src="https://via.placeholder.com/800x400?text=Infraestructura" alt="Infraestructura" />
        <p>
          Contamos con estudios, foros y equipo de última generación para
          desarrollar proyectos de cualquier escala.
        </p>
      </div>
    </section>
  );
}
