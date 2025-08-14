import styles from './Infraestructura.module.css';

const content = {
  es: {
    title: 'Infraestructura',
    studiosTitle: 'Estudios y Foros',
    studios: ['EGGM Argos', '7 Digital', 'UC Roma', 'Audio Pent House'],
    techTitle: 'Tecnología',
    tech: [
      'Pantallas LED de gran formato',
      'Equipos de producción y postproducción de última generación',
      'Capacidad para proyectos en volumen virtual y set real',
    ],
  },
  en: {
    title: 'Infrastructure',
    studiosTitle: 'Studios & Stages',
    studios: ['EGGM Argos', '7 Digital', 'UC Roma', 'Audio Pent House'],
    techTitle: 'Technology',
    tech: [
      'Large-format LED walls',
      'State-of-the-art production and post-production equipment',
      'Capability for virtual volume and real set projects',
    ],
  },
};

export default function Infraestructura({ lang = 'es' }) {
  const t = content[lang];
  return (
    <section className={styles.section}>
      <img
        src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80"
        alt="LED wall"
        className={styles.background}
        loading="lazy"
      />
      <div className={styles.overlay}>
        <h2 className={styles.title}>{t.title}</h2>
        <h3 className={styles.subtitle}>{t.studiosTitle}</h3>
        <ul className={styles.list}>
          {t.studios.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <h3 className={styles.subtitle}>{t.techTitle}</h3>
        <ul className={styles.list}>
          {t.tech.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <video
          src="https://www.w3schools.com/html/mov_bbb.mp4"
          className={styles.video}
          controls
        />
      </div>
    </section>
  );
}
