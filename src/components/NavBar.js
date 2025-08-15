"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaInstagram, FaEnvelope, FaGlobe, FaRegLightbulb } from 'react-icons/fa';
import styles from './NavBar.module.css';

const labels = {
  es: {
    home: 'Home',
    about: 'Sobre nosotros',
    original: 'Contenido original',
    virtual: 'Virtual Production',
    services: 'Servicios de Producción',
    team: 'Equipo',
    contact: 'Contacto',
  },
  en: {
    home: 'Home',
    about: 'About',
    original: 'Original Content',
    virtual: 'Virtual Production',
    services: 'Production Services',
    team: 'Team',
    contact: 'Contact',
  },
};

const paths = {
  es: {
    home: '/',
    about: '/about',
    original: '/contenido',
    virtual: '/virtual',
    services: '/servicios',
    team: '/equipo',
    contact: '/contacto',
    switch: '/en',
  },
  en: {
    home: '/en',
    about: '/en/about',
    original: '/en/original-content',
    virtual: '/en/virtual-production',
    services: '/en/production-services',
    team: '/en/team',
    contact: '/en/contact',
    switch: '/',
  },
};

export default function NavBar({ lang = 'es' }) {
  const l = labels[lang];
  const p = paths[lang];
  const pathname = usePathname();

  const linkClass = (path) =>
    pathname === path ? `${styles.link} ${styles.active}` : styles.link;

  return (
    <nav className={styles.nav}>
      <Link href={p.home} className={styles.logo}>
        <FaRegLightbulb className={styles.logoIcon} />
        <span className={styles.logoText}>LIGHT CHANNEL</span>
      </Link>
      <div className={styles.links}>
        <Link href={p.about} className={linkClass(p.about)}>
          {l.about}
        </Link>
        <Link href={p.original} className={linkClass(p.original)}>
          {l.original}
        </Link>
        <Link href={p.virtual} className={linkClass(p.virtual)}>
          {l.virtual}
        </Link>
        <Link href={p.services} className={linkClass(p.services)}>
          {l.services}
        </Link>
        <Link href={p.team} className={linkClass(p.team)}>
          {l.team}
        </Link>
        <Link href={p.contact} className={linkClass(p.contact)}>
          {l.contact}
        </Link>
      </div>
      <div className={styles.icons}>
        <Link
          href="https://instagram.com"
          className={styles.icon}
          aria-label="Instagram"
        >
          <FaInstagram />
        </Link>
        <Link
          href="mailto:info@example.com"
          className={styles.icon}
          aria-label="Email"
        >
          <FaEnvelope />
        </Link>
        <Link href={p.switch} className={`${styles.icon} ${styles.langSwitcher}`}>
          <FaGlobe />
          <span className={styles.langLabel}>
            {lang === 'es' ? 'English' : 'Español'}
          </span>
          <span className={styles.arrow}>▾</span>
        </Link>
      </div>
    </nav>
  );
}

