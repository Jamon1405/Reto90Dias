"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();

  const linkClass = (path) =>
    `${styles.link} ${pathname === path ? styles.active : ''}`;

  return (
    <nav className={styles.nav}>
      <Link href={p.home} className={`${styles.brand} ${linkClass(p.home)}`}>
        Light Channel
      </Link>
      <Link href={p.about} className={linkClass(p.about)}>
        {l.about}
      </Link>
      <Link href={p.work} className={linkClass(p.work)}>
        {l.work}
      </Link>
      <Link href={p.contact} className={linkClass(p.contact)}>
        {l.contact}
      </Link>
      <div className={styles.spacer} />
      <Link href={p.switch} className={`${styles.lang} ${styles.link}`}>
        {l.switchLabel}
      </Link>
    </nav>
  );
}
