import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <section className={styles.hero}>
      <video
        autoPlay
        muted
        loop
        playsInline
        className={styles.video}
      >
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
      </video>
      <div className={styles.overlay}>
        <h1>Light Channel</h1>
        <p>Producción sin límites</p>
        <Link href="/quienes-somos" className={styles.button}>
          Conoce más
        </Link>
      </div>
    </section>
  );
}
