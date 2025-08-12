import styles from './PropuestaValor.module.css';

const content = {
  es: {
    title: 'Nuestra propuesta de valor',
    body:
      'En Light Channel combinamos creatividad, innovación tecnológica y experiencia para llevar las ideas a su máxima expresión. Evolucionamos con las nuevas formas de consumir contenido, explorando formatos verticales, experiencias inmersivas y producciones híbridas que conectan con las audiencias actuales.',
  },
  en: {
    title: 'Our value proposition',
    body:
      'At Light Channel we blend creativity, technological innovation and experience to bring ideas to their fullest expression. We evolve with new ways of consuming content, exploring vertical formats, immersive experiences and hybrid productions that connect with today\'s audiences.',
  },
};

export default function PropuestaValor({ lang = 'es' }) {
  const t = content[lang];
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{t.title}</h2>
      <p className={styles.text}>{t.body}</p>
      <img
        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
        alt="Creative workspace"
        className={styles.image}
        loading="lazy"
      />
    </section>
  );
}
