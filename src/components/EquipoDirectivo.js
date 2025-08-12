"use client";
import styles from './EquipoDirectivo.module.css';

const content = {
  es: {
    title: 'Equipo Directivo',
    members: [
      {
        name: 'Carlos Perezcano',
        role: 'CEO',
        bio: 'Visionario con más de 25 años liderando producciones de alto impacto.',
        img: 'https://images.unsplash.com/photo-1603415526960-f7e0328a2c1f?auto=format&fit=crop&w=800&q=80',
        link: '#',
      },
      {
        name: 'Magda Talavera',
        role: 'Directora Comercial y Productora',
        bio: 'Especialista en estrategias comerciales y dirección de equipos creativos.',
        img: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
        link: '#',
      },
      {
        name: 'Miguel Batz',
        role: 'Productor Ejecutivo',
        bio: 'Coordina operaciones y asegura entregas impecables en cada proyecto.',
        img: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
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
        bio: 'Visionary with more than 25 years leading high-impact productions.',
        img: 'https://images.unsplash.com/photo-1603415526960-f7e0328a2c1f?auto=format&fit=crop&w=800&q=80',
        link: '#',
      },
      {
        name: 'Magda Talavera',
        role: 'Commercial Director & Producer',
        bio: 'Specialist in commercial strategies and creative team leadership.',
        img: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
        link: '#',
      },
      {
        name: 'Miguel Batz',
        role: 'Executive Producer',
        bio: 'Oversees operations and ensures flawless delivery on every project.',
        img: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
        link: '#',
      },
    ],
  },
};

export default function EquipoDirectivo({ lang = 'es' }) {
  const t = content[lang];
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{t.title}</h2>
      <div className={styles.grid}>
        {t.members.map((m) => (
          <a
            key={m.name}
            href={m.link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
          >
            <img src={m.img} alt={m.name} className={styles.image} loading="lazy" />
            <div className={styles.overlay}>
              <h3 className={styles.name}>{m.name}</h3>
              <p className={styles.role}>{m.role}</p>
              <p className={styles.bio}>{m.bio}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
