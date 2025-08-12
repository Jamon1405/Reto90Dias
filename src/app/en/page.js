import Link from 'next/link';
import styles from './home.module.css';

export default function EnHome() {
  return (
    <section className={styles.hero}>
      <h1>Light Channel</h1>
      <p>Production without limits</p>
      <Link href="/en/about" className={styles.button}>
        Learn more
      </Link>
    </section>
  );
}
