import styles from './SeriesVerticales.module.css';

const content = {
  es: {
    title: 'Series verticales',
    items: ['“El Secreto” — Suspenso en 9:16', '“Detrás del Reto” — Acceso exclusivo'],
  },
  en: {
    title: 'Vertical series',
    items: ['“El Secreto” — 9:16 thriller', '“Behind the Challenge” — Exclusive access'],
  },
};

export default function SeriesVerticales({ lang = 'es' }) {
  const t = content[lang];
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{t.title}</h2>
      <ul className={styles.list}>
        {t.items.map((i) => (
          <li key={i} className={styles.item}>
            <div className={styles.videoPlaceholder} />
            <p>{i}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
