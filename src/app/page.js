import Link from 'next/link';
import styles from './page.module.css';

export default function LanguageSelect() {
  return (
    <section className={styles.selector}>
      <Link href="/es" className={styles.link}>Español</Link>
      <Link href="/en" className={styles.link}>English</Link>
    </section>
  );
}
