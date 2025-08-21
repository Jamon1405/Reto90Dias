"use client";
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Hero.module.css';

const content = {
  es: {
    title: 'Light Channel',
    tagline: 'Producción sin límites para cine y TV',
    cta: 'Ver portafolio',
    ctaHref: '/contenido',
    logos: [
      {
        src: 'https://placehold.co/100x50?text=Cliente+1',
        alt: 'Cliente 1',
      },
      {
        src: 'https://placehold.co/100x50?text=Cliente+2',
        alt: 'Cliente 2',
      },
      {
        src: 'https://placehold.co/100x50?text=Cliente+3',
        alt: 'Cliente 3',
      },
    ],
  },
  en: {
    title: 'Light Channel',
    tagline: 'Production without limits for film and TV',
    cta: 'View portfolio',
    ctaHref: '/en/original-content',
    logos: [
      {
        src: 'https://placehold.co/100x50?text=Client+1',
        alt: 'Client 1',
      },
      {
        src: 'https://placehold.co/100x50?text=Client+2',
        alt: 'Client 2',
      },
      {
        src: 'https://placehold.co/100x50?text=Client+3',
        alt: 'Client 3',
      },
    ],
  },
};

export default function Hero({ lang = 'es' }) {
  const t = content[lang];
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const restart = () => {
      video.currentTime = 0;
      void video.play();
    };
    restart();
    video.addEventListener('ended', restart);
    video.addEventListener('pause', restart);
    return () => {
      video.removeEventListener('ended', restart);
      video.removeEventListener('pause', restart);
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
        <Link href={t.ctaHref} className={styles.cta}>
          {t.cta}
        </Link>
        <div className={styles.logos}>
          {t.logos.map((logo) => (
            <Image
              key={logo.src}
              src={logo.src}
              alt={logo.alt}
              width={100}
              height={50}
              className={styles.logo}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
