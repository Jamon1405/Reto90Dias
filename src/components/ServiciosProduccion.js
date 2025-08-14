"use client";
import { useState } from 'react';
import styles from './ServiciosProduccion.module.css';

const content = {
  es: {
    title: 'Servicios de Producción',
    tabs: [
      { id: 'foros', label: 'Foros', body: 'Acceso a estudios como EGGM Argos, 7 Digital, UC Roma y más.' },
      { id: 'produccion', label: 'Equipos de producción', body: 'Equipo creativo y técnico de alto nivel para cada proyecto.' },
      { id: 'post', label: 'Equipos de post producción', body: 'Tecnología de última generación para edición y finalización.' },
    ],
  },
  en: {
    title: 'Production Services',
    tabs: [
      { id: 'foros', label: 'Stages', body: 'Access to studios like EGGM Argos, 7 Digital, UC Roma and more.' },
      { id: 'produccion', label: 'Production crews', body: 'Top creative and technical teams for every project.' },
      { id: 'post', label: 'Post-production crews', body: 'State-of-the-art technology for editing and finishing.' },
    ],
  },
};

export default function ServiciosProduccion({ lang = 'es' }) {
  const t = content[lang];
  const [active, setActive] = useState(t.tabs[0].id);
  const current = t.tabs.find((tab) => tab.id === active);

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{t.title}</h2>
      <div className={styles.tabs}>
        {t.tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`${styles.tab} ${active === tab.id ? styles.active : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <p className={styles.body}>{current.body}</p>
    </section>
  );
}
