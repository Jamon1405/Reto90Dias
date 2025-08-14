import Image from 'next/image';
import styles from './QuienesSomos.module.css';

const content = {
  es: {
    title: 'Quiénes somos',
    body:
      'En Light Channel vivimos para contar historias. Combinamos experiencia, tecnología y un equipo apasionado para producir contenidos que sorprenden y conectan con la audiencia.',
  },
  en: {
    title: 'About us',
    body:
      'At Light Channel we live to tell stories. We blend experience, technology and passion to deliver content that engages and inspires.',
  },
};

export default function QuienesSomos({ lang = 'es' }) {
  const t = content[lang];
  return (
    <section className={styles.section}>
      <Image
        src="https://images.unsplash.com/photo-1581091870622-7d4b39ed64f0?auto=format&fit=crop&w=1600&q=80"
        alt="Studio setup"
        className={styles.background}
        fill
        sizes="100vw"
      />
      <div className={styles.overlay}>
        <h2 className={styles.title}>{t.title}</h2>
        <p className={styles.text}>{t.body}</p>
      </div>
    </section>
  );
}
