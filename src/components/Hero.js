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
  return (
    <section className={styles.hero}>
      <video
        className={styles.video}
        autoPlay
        muted
        loop
        playsInline
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
