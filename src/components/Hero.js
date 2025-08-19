"use client";
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './Hero.module.css';

const content = {
  es: {
    title: 'Light Channel',
    tagline: 'Producción sin límites',
    cta: 'Ver trabajo',
    ctaLink: '/work',
  },
  en: {
    title: 'Light Channel',
    tagline: 'Production without limits',
    cta: 'See work',
    ctaLink: '/en/work',
  },
};

export default function Hero({ lang = 'es' }) {
  const t = content[lang];
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleEnded = () => {
      video.currentTime = 0;
      void video.play();
    };
    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <section className={styles.hero}>
      <video
        ref={videoRef}
        className={styles.video}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        src="/Logo Animado.mp4"
      />
      <div className={styles.overlay}>
        <h1 className={styles.title}>{t.title}</h1>
        <p className={styles.tagline}>{t.tagline}</p>
        <Link href={t.ctaLink} className={styles.cta}>
          {t.cta}
        </Link>
      </div>
    </section>
  );
}
