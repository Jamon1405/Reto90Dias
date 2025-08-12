import styles from './EquipoDirectivo.module.css';

const content = {
  es: {
    title: 'Equipo Directivo',
      members: [
        {
          name: 'Carlos Perezcano',
          role: 'CEO',
          link: '#',
        },
        {
          name: 'Magda Talavera',
          role: 'Directora Comercial y Productora',
          link: '#',
        },
        {
          name: 'Miguel Batz',
          role: 'Productor Ejecutivo',
          link: '#',
        },
      ],
  },
  en: {
    title: 'Leadership',
      members: [
        {
          name: 'Carlos Perezcano',
          role: 'CEO',
          link: '#',
        },
        {
          name: 'Magda Talavera',
          role: 'Commercial Director & Producer',
          link: '#',
        },
        {
          name: 'Miguel Batz',
          role: 'Executive Producer',
          link: '#',
        },
      ],
  },
};

export default function EquipoDirectivo({ lang = 'es' }) {
  const t = content[lang];
  return (
    <section className={styles.section}>
      <img
        src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=1600&q=80"
        alt="Team meeting"
        className={styles.background}
        loading="lazy"
      />
      <div className={styles.overlay}>
        <h2 className={styles.title}>{t.title}</h2>
        <ul className={styles.list}>
            {t.members.map((m) => (
              <li key={m.name}>
                <a href={m.link} target="_blank" rel="noopener noreferrer">
                  <strong>{m.name}</strong>
                </a>{' '}
                — {m.role}
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
}
