"use client";

import { useState } from 'react';
import styles from './ServiciosProduccion.module.css';

const content = {
  es: {
    title: 'Servicios de Producción',
    tabs: {
      produccion: {
        label: 'Producción',
        items: [
          {
            icon: '🏢',
            label: 'Foro A',
            body: 'Espacio insonorizado de 500 m² con ciclorama verde.',
          },
          {
            icon: '🏢',
            label: 'Foro B',
            body: 'Foro con grúa motorizada y sistema de iluminación DMX.',
          },
          {
            icon: '🏙️',
            label: 'Backlot',
            body: 'Exterior para sets modulares y escenas urbanas.',
          },
        ],
      },
      post: {
        label: 'Post',
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
      produccion: {
        label: 'Production',
        items: [
          {
            icon: '🏢',
            label: 'Stage A',
            body: 'Soundproof 500 m² stage with green cyclorama.',
          },
          {
            icon: '🏢',
            label: 'Stage B',
            body: 'Stage with motorized crane and DMX lighting system.',
          },
          {
            icon: '🏙️',
            label: 'Backlot',
            body: 'Outdoor area for modular sets and urban scenes.',
          },
        ],
      },
      post: {
        label: 'Post',
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
  const [tab, setTab] = useState('produccion');
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
            <div className={styles.icon}>{item.icon}</div>
            <h3 className={styles.cardTitle}>{item.label}</h3>
            <p className={styles.body}>{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
