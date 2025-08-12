import styles from './QuienesSomos.module.css';

export default function QuienesSomos() {
  return (
    <section id="quienes-somos" className={styles.section}>
      <h2 className={styles.title}>Quiénes somos</h2>
      <div className={styles.content}>
        <img src="https://via.placeholder.com/800x400?text=Quienes+Somos" alt="Equipo de Light Channel" />
        <p>
          Light Channel es una casa productora comprometida con crear contenido
          audiovisual de alto impacto y calidad cinematográfica.
        </p>
      </div>
    </section>
  );
}
