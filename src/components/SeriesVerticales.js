import styles from './SeriesVerticales.module.css';

const content = {
  es: {
    title: 'Series verticales',
    items: ['"El Secreto"', 'Otra serie vertical'],
  },
  en: {
    title: 'Vertical series',
    items: ['"El Secreto"', 'Another vertical series'],
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
