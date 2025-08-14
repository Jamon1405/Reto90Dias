import styles from './ProduccionesDestacadas.module.css';

const content = {
  es: {
    title: 'Producciones destacadas',
    items: [
      '“El Reto de Creadores” — YouTube Originals',
      '“Mamá ya es mi Casa” — TelevisaUnivision',
      '“Tengo Talento, Mucho Talento” — Estrella TV',
      '“Alarma TV” — Estrella TV',
    ],
  },
  en: {
    title: 'Featured productions',
    items: [
      '“El Reto de Creadores” — YouTube Originals',
      '“Mamá ya es mi Casa” — TelevisaUnivision',
      '“Tengo Talento, Mucho Talento” — Estrella TV',
      '“Alarma TV” — Estrella TV',
    ],
  },
};

export default function ProduccionesDestacadas({ lang = 'es' }) {
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
