import styles from './QuienesSomos.module.css';

const content = {
  es: {
    hero: 'Light Channel — Producción sin límites',
    title: 'Quiénes somos',
    body:
      'Light Channel es una empresa líder en entretenimiento con más de 25 años de trayectoria en la industria audiovisual. Nuestra experiencia abarca televisión, realities, series, conciertos, comerciales y eventos, respaldada por un equipo creativo y técnico de alto nivel, así como por infraestructura de última generación.',
  },
  en: {
    hero: 'Light Channel — Production without limits',
    title: 'About us',
    body:
      'Light Channel is a leading entertainment company with more than 25 years in the audiovisual industry. Our experience spans television, reality, series, concerts, commercials and events, backed by a high-level creative and technical team and state-of-the-art infrastructure.',
  },
};

export default function QuienesSomos({ lang = 'es' }) {
  const t = content[lang];
  return (
    <section className={styles.section}>
      <h1 className={styles.hero}>{t.hero}</h1>
      <h2 className={styles.title}>{t.title}</h2>
      <p className={styles.text}>{t.body}</p>
      <img
        src="https://images.unsplash.com/photo-1581091870622-7d4b39ed64f0?auto=format&fit=crop&w=1200&q=80"
        alt="Studio setup"
        className={styles.image}
        loading="lazy"
      />
    </section>
  );
}
