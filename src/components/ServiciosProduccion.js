import styles from './ServiciosProduccion.module.css';

const content = {
  es: {
    title: 'Servicios de Producción',
    items: [
      {
        icon: '🎬',
        label: 'Foros',
        body: 'Acceso a foros equipados con tecnología de punta para cualquier escala de producción.',
      },
      {
        icon: '👥',
        label: 'Equipos de producción',
        body: 'Productores, directores y crew con experiencia internacional.',
      },
      {
        icon: '💻',
        label: 'Postproducción',
        body: 'Edición, color y VFX con flujos 4K y HDR.',
      },
    ],
  },
  en: {
    title: 'Production Services',
    items: [
      {
        icon: '🎬',
        label: 'Stages',
        body: 'Access to sound stages packed with cutting‑edge technology for any scale.',
      },
      {
        icon: '👥',
        label: 'Production crews',
        body: 'Producers, directors and crew with international experience.',
      },
      {
        icon: '💻',
        label: 'Post-production',
        body: 'Editing, color and VFX in 4K and HDR workflows.',
      },
    ],
  },
};

export default function ServiciosProduccion({ lang = 'es' }) {
  const t = content[lang];
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{t.title}</h2>
      <div className={styles.grid}>
        {t.items.map((item) => (
          <div key={item.label} className={styles.card}>
            <div className={styles.icon}>{item.icon}</div>
            <h3 className={styles.cardTitle}>{item.label}</h3>
            <p className={styles.body}>{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
