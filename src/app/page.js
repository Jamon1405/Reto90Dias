import styles from './home.module.css';

export default function HomePage() {
  return (
    <section className={styles.hero}>
      <div>
        <h1>Light Channel</h1>
        <p>Producción audiovisual de alto impacto.</p>
      </div>
    </section>
  );
}
