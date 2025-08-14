"use client";

import { useState } from 'react';
import styles from './ServiciosProduccion.module.css';

const content = {
  es: {
    title: 'Servicios de Producción',
    tabs: {
      foro: {
        label: 'Foro',
        items: [
          {
            image: 'https://placehold.co/600x400?text=Foro+A',
            label: 'Foro A',
            body: 'Espacio insonorizado de 500 m² con ciclorama verde.',
          },
          {
            image: 'https://placehold.co/600x400?text=Foro+B',
            label: 'Foro B',
            body: 'Foro con grúa motorizada y sistema de iluminación DMX.',
          },
          {
            image: 'https://placehold.co/600x400?text=Backlot',
            label: 'Backlot',
            body: 'Exterior para sets modulares y escenas urbanas.',
          },
        ],
      },
      produccion: {
        label: 'Producción',
        items: [
          {
            icon: '🎬',
            label: 'Equipo',
            body: 'Directores, fotógrafos y técnicos con experiencia internacional.',
          },
          {
            icon: '🎥',
            label: 'Equipamiento',
            body: 'Cámaras cinema, grúas y sistemas de motion control.',
          },
          {
            icon: '🗺️',
            label: 'Locaciones',
            body: 'Coordinación y scouting para todo tipo de escenarios.',
          },
        ],
      },
      post: {
        label: 'Post Producción',
        items: [
          {
            icon: '💻',
            label: 'Edición',
            body: 'Suites con flujos 4K HDR y colaboración remota.',
          },
          {
            icon: '🎨',
            label: 'Color',
            body: 'Corrección de color con monitoreo calibrado en Dolby Vision.',
          },
          {
            icon: '🪄',
            label: 'VFX',
            body: 'Integración de efectos visuales y composición avanzada.',
          },
        ],
      },
    },
  },
  en: {
    title: 'Production Services',
    tabs: {
      foro: {
        label: 'Stages',
        items: [
          {
            image: 'https://placehold.co/600x400?text=Stage+A',
            label: 'Stage A',
            body: 'Soundproof 500 m² stage with green cyclorama.',
          },
          {
            image: 'https://placehold.co/600x400?text=Stage+B',
            label: 'Stage B',
            body: 'Stage with motorized crane and DMX lighting system.',
          },
          {
            image: 'https://placehold.co/600x400?text=Backlot',
            label: 'Backlot',
            body: 'Outdoor area for modular sets and urban scenes.',
          },
        ],
      },
      produccion: {
        label: 'Production',
        items: [
          {
            icon: '🎬',
            label: 'Crew',
            body: 'Directors, DPs and technicians with global experience.',
          },
          {
            icon: '🎥',
            label: 'Gear',
            body: 'Cinema cameras, cranes and motion control systems.',
          },
          {
            icon: '🗺️',
            label: 'Locations',
            body: 'Scouting and coordination for any type of setting.',
          },
        ],
      },
      post: {
        label: 'Post Production',
        items: [
          {
            icon: '💻',
            label: 'Editing',
            body: 'Suites with 4K HDR workflows and remote collaboration.',
          },
          {
            icon: '🎨',
            label: 'Color',
            body: 'Color grading with calibrated Dolby Vision monitoring.',
          },
          {
            icon: '🪄',
            label: 'VFX',
            body: 'Visual effects integration and advanced compositing.',
          },
        ],
      },
    },
  },
};

export default function ServiciosProduccion({ lang = 'es' }) {
  const t = content[lang];
  const [tab, setTab] = useState('foro');
  const current = t.tabs[tab];

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{t.title}</h2>
      <div className={styles.tabs}>
        {Object.entries(t.tabs).map(([key, info]) => (
          <button
            key={key}
            className={`${styles.tab} ${tab === key ? styles.tabActive : ''}`}
            onClick={() => setTab(key)}
          >
            {info.label}
          </button>
        ))}
      </div>
      <div className={styles.grid}>
        {current.items.map((item) => (
          <div key={item.label} className={styles.card}>
            {item.image ? (
              <img src={item.image} alt="" className={styles.image} />
            ) : (
              <div className={styles.icon}>{item.icon}</div>
            )}
            <h3 className={styles.cardTitle}>{item.label}</h3>
            <p className={styles.body}>{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
