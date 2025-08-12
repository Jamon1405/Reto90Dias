import Link from 'next/link';
import styles from './NavBar.module.css';

const labels = {
  es: {
    about: 'Quiénes somos',
    core: 'Core Business',
    infra: 'Infraestructura',
    prod: 'Producciones destacadas',
    value: 'Propuesta de valor',
    team: 'Equipo Directivo',
    contact: 'Contacto',
    switchLabel: 'EN',
  },
  en: {
    about: 'About',
    core: 'Core Business',
    infra: 'Infrastructure',
    prod: 'Featured productions',
    value: 'Value proposition',
    team: 'Leadership',
    contact: 'Contact',
    switchLabel: 'ES',
  },
};

const paths = {
  es: {
    home: '/es',
    about: '/es/quienes-somos',
    core: '/es/core-business',
    infra: '/es/infraestructura',
    prod: '/es/producciones-destacadas',
    value: '/es/propuesta-valor',
    team: '/es/equipo-directivo',
    contact: '/es/contacto',
    switch: '/en',
  },
  en: {
    home: '/en',
    about: '/en/about',
    core: '/en/core-business',
    infra: '/en/infrastructure',
    prod: '/en/featured-productions',
    value: '/en/value-proposition',
    team: '/en/leadership',
    contact: '/en/contact',
    switch: '/es',
  },
};

export default function NavBar({ lang = 'es' }) {
  const l = labels[lang];
  const p = paths[lang];
  return (
    <nav className={styles.nav}>
      <Link href={p.home} className={styles.brand}>Light Channel</Link>
      <Link href={p.about}>{l.about}</Link>
      <Link href={p.core}>{l.core}</Link>
      <Link href={p.infra}>{l.infra}</Link>
      <Link href={p.prod}>{l.prod}</Link>
      <Link href={p.value}>{l.value}</Link>
      <Link href={p.team}>{l.team}</Link>
      <Link href={p.contact}>{l.contact}</Link>
      <div className={styles.spacer} />
      <Link href={p.switch} className={styles.lang}>{l.switchLabel}</Link>
    </nav>
  );
}
