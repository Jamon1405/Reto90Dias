"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
            body: 'Espacio principal con 600 m² y ciclorama blanco para producciones de gran escala.',
          },
          {
            image: 'https://placehold.co/600x400?text=Foro+B',
            label: 'Foro B',
            body: 'Foro versátil de 400 m² ideal para programas de revista o comerciales.',
          },
          {
            image: 'https://placehold.co/600x400?text=Foro+C',
            label: 'Foro C',
            body: 'Espacio íntimo de 200 m² perfecto para entrevistas y sets especializados.',
          },
          {
            image: 'https://placehold.co/600x400?text=Pantalla+LED',
            label: 'Pantallas LED',
            body: 'Muros LED que transforman el escenario en tiempo real para una inmersión total.',
          },
        ],
      },
      produccion: {
        label: 'Producción',
        items: [
          {
            icon: '🎨',
            label: 'Equipo creativo',
            body: 'Guionistas, directores y productores que materializan tu visión.',
          },
          {
            icon: '🎥',
            label: 'Equipo técnico',
            body: 'Operadores de cámara, sonido e iluminación con experiencia en set.',
          },
        ],
      },
      post: {
        label: 'Post Producción',
        items: [
          {
            icon: '🛠️',
            label: 'Equipo de Producción y Post Producción',
            body: 'Coordinadores y editores que cierran cada proyecto con calidad broadcast.',
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
            body: 'Main 600 m² stage with white cyclorama for large productions.',
          },
          {
            image: 'https://placehold.co/600x400?text=Stage+B',
            label: 'Stage B',
            body: 'Flexible 400 m² space ideal for talk shows or commercials.',
          },
          {
            image: 'https://placehold.co/600x400?text=Stage+C',
            label: 'Stage C',
            body: 'Cozy 200 m² stage designed for interviews and specialty sets.',
          },
          {
            image: 'https://placehold.co/600x400?text=LED+Wall',
            label: 'LED Wall',
            body: 'LED volumes that reshape the scenery in real time for full immersion.',
          },
        ],
      },
      produccion: {
        label: 'Production',
        items: [
          {
            icon: '🎨',
            label: 'Creative team',
            body: 'Writers, directors and producers bringing your vision to life.',
          },
          {
            icon: '🎥',
            label: 'Technical crew',
            body: 'Camera, sound and lighting operators seasoned on set.',
          },
        ],
      },
      post: {
        label: 'Post Production',
        items: [
          {
            icon: '🛠️',
            label: 'Production & Post team',
            body: 'Coordinators and editors delivering broadcast-quality finishes.',
          },
        ],
      },
    },
  },
};

export default function ServiciosProduccion({ lang = 'es' }) {
  const t = content[lang];
  const [tab, setTab] = useState('foro');
  const [forumIndex, setForumIndex] = useState(0);
  const current = t.tabs[tab];

  useEffect(() => {
    setForumIndex(0);
  }, [tab]);

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
        {tab === 'foro' ? (
          <>
            <div className={styles.subTabs}>
              {current.items.map((item, idx) => (
                <button
                  key={item.label}
                  className={`${styles.tab} ${forumIndex === idx ? styles.tabActive : ''}`}
                  onClick={() => setForumIndex(idx)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className={styles.forumPane}>
              <Image
                src={current.items[forumIndex].image}
                alt=""
                className={styles.forumImage}
                width={600}
                height={400}
              />
              <p className={styles.body}>{current.items[forumIndex].body}</p>
            </div>
          </>
        ) : (
          <div className={styles.grid}>
            {current.items.map((item) => (
              <div key={item.label} className={styles.card}>
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    className={styles.image}
                    width={600}
                    height={400}
                  />
                ) : (
                  <div className={styles.icon}>{item.icon}</div>
                )}
                <h3 className={styles.cardTitle}>{item.label}</h3>
                <p className={styles.body}>{item.body}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }
