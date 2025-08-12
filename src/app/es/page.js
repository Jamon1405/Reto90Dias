import Link from 'next/link';
import styles from './home.module.css';

export default function EsHome() {
  return (
    <section className={styles.hero}>
      <h1>Light Channel</h1>
      <p>Producción sin límites</p>
      <Link href="/es/quienes-somos" className={styles.button}>
        Conoce más
      </Link>
    </section>
  );
}
