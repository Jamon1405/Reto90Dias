"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
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
      switchLabel: 'EN',
    },
    en: {
      home: 'Home',
      about: 'About',
      original: 'Original Content',
      virtual: 'Virtual Production',
      services: 'Production Services',
      team: 'Team',
      contact: 'Contact',
      switchLabel: 'ES',
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
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastY && currentY > 100) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastY = currentY;
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkClass = (path) =>
    `${styles.link} ${pathname === path ? styles.active : ''}`;

  return (
    <nav className={`${styles.nav} ${hidden ? styles.hidden : ''}`}>
      <Link href={p.home} className={`${styles.brand} ${linkClass(p.home)}`}>
        Light Channel
      </Link>
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
      <div className={styles.spacer} />
      <Link href={p.switch} className={`${styles.lang} ${styles.link}`}>
        {l.switchLabel}
      </Link>
    </nav>
  );
}
