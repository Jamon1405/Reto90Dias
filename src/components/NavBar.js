import Link from 'next/link';
import styles from './NavBar.module.css';

const labels = {
  es: { home: 'Home', about: 'About', work: 'Work', contact: 'Contacto', switchLabel: 'EN' },
  en: { home: 'Home', about: 'About', work: 'Work', contact: 'Contact', switchLabel: 'ES' },
};

const paths = {
  es: { home: '/', about: '/about', work: '/work', contact: '/contact', switch: '/en' },
  en: { home: '/en', about: '/en/about', work: '/en/work', contact: '/en/contact', switch: '/' },
};

export default function NavBar({ lang = 'es' }) {
  const l = labels[lang];
  const p = paths[lang];
  return (
    <nav className={styles.nav}>
      <Link href={p.home} className={styles.brand}>
        Light Channel
      </Link>
      <Link href={p.about}>{l.about}</Link>
      <Link href={p.work}>{l.work}</Link>
      <Link href={p.contact}>{l.contact}</Link>
      <div className={styles.spacer} />
      <Link href={p.switch} className={styles.lang}>
        {l.switchLabel}
      </Link>
    </nav>
  );
}
