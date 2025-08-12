import styles from './ProduccionesDestacadas.module.css';

const content = {
  es: {
    title: 'Producciones destacadas',
    items: [
      '“El Reto de Creadores” — YouTube Originals',
      '“Mamá ya es mi Casa” — TelevisaUnivision',
      '“El Secreto” — Serie vertical original de Light Channel',
      '“Tengo Talento, Mucho Talento” — Estrella TV',
      '“Alarma TV” — Estrella TV',
    ],
  },
  en: {
    title: 'Featured productions',
    items: [
      '“El Reto de Creadores” — YouTube Originals',
      '“Mamá ya es mi Casa” — TelevisaUnivision',
      '“El Secreto” — Light Channel original vertical series',
      '“Tengo Talento, Mucho Talento” — Estrella TV',
      '“Alarma TV” — Estrella TV',
    ],
  },
};

export default function ProduccionesDestacadas({ lang = 'es' }) {
  const t = content[lang];
  return (
    <section className={styles.section}>
      <img
        src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1600&q=80"
        alt="Camera setup"
        className={styles.background}
        loading="lazy"
      />
      <div className={styles.overlay}>
        <h2 className={styles.title}>{t.title}</h2>
        <ul className={styles.list}>
          {t.items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
