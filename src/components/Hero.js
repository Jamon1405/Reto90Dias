"use client";
import { useEffect, useRef, useState } from 'react';
import styles from './Hero.module.css';
import VideoModal from './VideoModal';

const content = {
  es: {
    title: 'Light Channel',
    tagline: 'Producción sin límites',
    cta: 'Ver trabajo',
  },
  en: {
    title: 'Light Channel',
    tagline: 'Production without limits',
    cta: 'See work',
  },
};

export default function Hero({ lang = 'es' }) {
  const t = content[lang];
  const videoRef = useRef(null);
  const [showReel, setShowReel] = useState(false);

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
        <button
          type="button"
          onClick={() => setShowReel(true)}
          className={styles.cta}
        >
          {t.cta}
        </button>
      </div>
      {showReel && (
        <VideoModal
          src="/VideoReel.mp4"
          onClose={() => setShowReel(false)}
        />
      )}
    </section>
  );
}
