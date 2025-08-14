import styles from './CoreBusiness.module.css';

const content = {
  es: {
    title: 'Nuestro core business',
    items: [
      '<strong>Contenido Original</strong> – Creación y desarrollo de formatos innovadores: talent shows, realities, noticieros, ficción, series verticales y más.',
      '<strong>Virtual Production</strong> – Producción de comerciales, telenovelas, series y videoclips con tecnología LED y entornos virtuales que optimizan tiempos y costos.',
      '<strong>Servicios de Producción 360</strong> – Soluciones integrales que incluyen preproducción, rodaje y postproducción, con acceso a estudios, foros, pantallas LED, equipo técnico y humano.',
    ],
  },
  en: {
    title: 'Our core business',
    items: [
      '<strong>Original Content</strong> – Creation and development of innovative formats: talent shows, reality, news, fiction, vertical series and more.',
      '<strong>Virtual Production</strong> – Production of commercials, soap operas, series and music videos with LED technology and virtual environments that optimize time and cost.',
      '<strong>360° Production Services</strong> – Comprehensive solutions covering pre-production, shooting and post-production with access to studios, LED walls and skilled crews.',
    ],
  },
};

export default function CoreBusiness({ lang = 'es' }) {
  const t = content[lang];
  return (
    <section className={styles.section}>
      <img
        src="https://images.unsplash.com/photo-1535185384036-9f18e86e5f5c?auto=format&fit=crop&w=1600&q=80"
        alt="Production control room"
        className={styles.background}
        loading="lazy"
      />
      <div className={styles.overlay}>
        <h2 className={styles.title}>{t.title}</h2>
        <ul className={styles.list}>
          {t.items.map((item) => (
            <li key={item} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      </div>
    </section>
  );
}
