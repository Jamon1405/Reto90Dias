"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  FaInstagram,
  FaEnvelope,
  FaGlobe,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
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
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const touch = window.matchMedia('(pointer: coarse)').matches;
    setIsTouch(touch);
    if (touch) {
      setHidden(false);
    }
  }, []);

  useEffect(() => {
    if (isTouch) {
      let lastY = window.scrollY;
      const handleScroll = () => {
        const currentY = window.scrollY;
        if (currentY > lastY && !open) {
          setHidden(true);
        } else {
          setHidden(false);
        }
        lastY = currentY;
      };
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }

    const reveal = (e) => {
      const y = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
      if (y <= 20) {
        setHidden(false);
      }
    };
    const conceal = () => {
      if (!open) {
        setHidden(true);
      }
    };
    window.addEventListener('mousemove', reveal);
    window.addEventListener('touchstart', reveal);
    window.addEventListener('scroll', conceal);
    return () => {
      window.removeEventListener('mousemove', reveal);
      window.removeEventListener('touchstart', reveal);
      window.removeEventListener('scroll', conceal);
    };
  }, [isTouch, open]);

  const toggleMenu = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setHidden(false);
    } else {
      setHidden(isTouch ? false : true);
    }
  };

  const linkClass = (path) =>
    pathname === path ? `${styles.link} ${styles.active}` : styles.link;

  return (
    <nav
      className={`${styles.nav} ${hidden ? styles.hidden : ''}`}
      onMouseLeave={() => !open && setHidden(true)}
    >
      <Link href={p.home} className={styles.logo}>
        <Image
          src="/Logo Light Channel.png"
          alt="Light Channel"
          width={400}
          height={100}
          priority
          className={styles.logoImage}
        />
      </Link>
      <button
        className={styles.menuToggle}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {open ? <FaTimes /> : <FaBars />}
      </button>
      <div className={open ? `${styles.menu} ${styles.open}` : styles.menu}>
        <div className={styles.links}>
          <Link
            href={p.about}
            className={linkClass(p.about)}
            onClick={() => {
              setOpen(false);
              setHidden(true);
            }}
          >
            {l.about}
          </Link>
          <Link
            href={p.original}
            className={linkClass(p.original)}
            onClick={() => {
              setOpen(false);
              setHidden(true);
            }}
          >
            {l.original}
          </Link>
          <Link
            href={p.virtual}
            className={linkClass(p.virtual)}
            onClick={() => {
              setOpen(false);
              setHidden(true);
            }}
          >
            {l.virtual}
          </Link>
          <Link
            href={p.services}
            className={linkClass(p.services)}
            onClick={() => {
              setOpen(false);
              setHidden(true);
            }}
          >
            {l.services}
          </Link>
          <Link
            href={p.team}
            className={linkClass(p.team)}
            onClick={() => {
              setOpen(false);
              setHidden(true);
            }}
          >
            {l.team}
          </Link>
          <Link
            href={p.contact}
            className={linkClass(p.contact)}
            onClick={() => {
              setOpen(false);
              setHidden(true);
            }}
          >
            {l.contact}
          </Link>
        </div>
        <div className={styles.icons}>
          <Link
            href="https://www.instagram.com/_lightchannel/"
            className={styles.icon}
            aria-label="Instagram"
            onClick={() => {
              setOpen(false);
              setHidden(true);
            }}
          >
            <FaInstagram />
          </Link>
          <Link
            href="mailto:info@example.com"
            className={styles.icon}
            aria-label="Email"
            onClick={() => {
              setOpen(false);
              setHidden(true);
            }}
          >
            <FaEnvelope />
          </Link>
          <Link
            href={p.switch}
            className={`${styles.icon} ${styles.langSwitcher}`}
            onClick={() => {
              setOpen(false);
              setHidden(true);
            }}
          >
            <FaGlobe />
            <span className={styles.langLabel}>
              {lang === 'es' ? 'English' : 'Español'}
            </span>
            <span className={styles.arrow}>▾</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

