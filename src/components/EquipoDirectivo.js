import styles from './EquipoDirectivo.module.css';

const content = {
  es: {
    title: 'Equipo Directivo',
    members: [
      { name: 'Carlos Perezcano', role: 'CEO' },
      { name: 'Magda Talavera', role: 'Directora Comercial y Productora' },
      { name: 'Miguel Batz', role: 'Productor Ejecutivo' },
    ],
  },
  en: {
    title: 'Leadership',
    members: [
      { name: 'Carlos Perezcano', role: 'CEO' },
      { name: 'Magda Talavera', role: 'Commercial Director & Producer' },
      { name: 'Miguel Batz', role: 'Executive Producer' },
    ],
  },
};

export default function EquipoDirectivo({ lang = 'es' }) {
  const t = content[lang];
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{t.title}</h2>
      <ul className={styles.list}>
        {t.members.map((m) => (
          <li key={m.name}>
            <strong>{m.name}</strong> — {m.role}
          </li>
        ))}
      </ul>
      <img
        src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=1200&q=80"
        alt="Team meeting"
        className={styles.image}
        loading="lazy"
      />
    </section>
  );
}
