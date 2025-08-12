import styles from './QuienesSomos.module.css';

export default function QuienesSomos() {
  return (
    <section id="quienes-somos" className={styles.section}>
      <h1 className={styles.hero}>Light Channel — Producción sin límites</h1>
      <h2 className={styles.title}>Quiénes somos</h2>
      <p className={styles.text}>
        Light Channel es una empresa líder en entretenimiento con más de 25 años de
        trayectoria en la industria audiovisual. Nuestra experiencia abarca televisión,
        realities, series, conciertos, comerciales y eventos, respaldada por un equipo
        creativo y técnico de alto nivel, así como por infraestructura de última
        generación.
      </p>
    </section>
  );
}
