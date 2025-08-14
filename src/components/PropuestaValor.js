import styles from './PropuestaValor.module.css';

const content = {
  es: {
    title: 'Nuestra propuesta de valor',
    body:
      'Transformamos ideas en experiencias memorables. Desde la preproducción hasta la post, nuestro enfoque integral garantiza resultados de alto impacto.',
  },
  en: {
    title: 'Our value proposition',
    body:
      'We turn ideas into memorable experiences. From pre to post production, our end-to-end approach delivers high-impact results.',
  },
};

export default function PropuestaValor({ lang = 'es' }) {
  const t = content[lang];
  return (
    <section className={styles.section}>
      <img
        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80"
        alt="Creative workspace"
        className={styles.background}
        loading="lazy"
      />
      <div className={styles.overlay}>
        <h2 className={styles.title}>{t.title}</h2>
        <p className={styles.text}>{t.body}</p>
      </div>
    </section>
  );
}
