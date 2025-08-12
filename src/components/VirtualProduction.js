import styles from './VirtualProduction.module.css';

const content = {
  es: {
    title: 'Virtual Production',
    body: 'Producción de comerciales, telenovelas, series y videoclips con tecnología LED y entornos virtuales que optimizan tiempos y costos.',
  },
  en: {
    title: 'Virtual Production',
    body: 'Production of commercials, soap operas, series and video clips with LED technology and virtual environments to optimize time and cost.',
  },
};

export default function VirtualProduction({ lang = 'es' }) {
  const t = content[lang];
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{t.title}</h2>
      <p className={styles.body}>{t.body}</p>
      <div className={styles.videoPlaceholder} />
    </section>
  );
}
