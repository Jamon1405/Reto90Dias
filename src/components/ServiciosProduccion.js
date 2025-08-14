"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './ServiciosProduccion.module.css';

const content = {
  es: {
    title: 'Servicios de Producción',
    tabs: {
      foro: {
        label: 'Foros',
        items: [
          {
            image:
              'https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?auto=format&fit=crop&w=1200&q=80',
            label: 'Estudios EGGM Argos',
            body:
              'Complejo con infraestructura de primer nivel para producciones de gran escala.',
          },
          {
            image:
              'https://images.unsplash.com/photo-1581276879432-15a63d16c6ac?auto=format&fit=crop&w=1200&q=80',
            label: 'Estudio 7 Digital',
            body:
              'Foro versátil con integración digital ideal para programas de revista o comerciales.',
          },
          {
            image:
              'https://images.unsplash.com/photo-1582711012124-a41f0c40e605?auto=format&fit=crop&w=1200&q=80',
            label: 'Foro UC Roma',
            body:
              'Espacio histórico adaptado para entrevistas y sets especializados.',
          },
        ],
      },
      led: {
        label: 'Pantallas LED',
        items: [
          {
            image: 'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?auto=format&fit=crop&w=1200&q=80',
            label: 'Pantallas LED',
            body:
              'Muros LED que transforman el escenario en tiempo real para una inmersión total.',
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
            image:
              'https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?auto=format&fit=crop&w=1200&q=80',
            label: 'EGGM Argos Studios',
            body:
              'Complex with top-tier infrastructure for large-scale productions.',
          },
          {
            image:
              'https://images.unsplash.com/photo-1581276879432-15a63d16c6ac?auto=format&fit=crop&w=1200&q=80',
            label: 'Studio 7 Digital',
            body:
              'Flexible digital stage ideal for talk shows or commercials.',
          },
          {
            image:
              'https://images.unsplash.com/photo-1582711012124-a41f0c40e605?auto=format&fit=crop&w=1200&q=80',
            label: 'UC Roma Stage',
            body: 'Historic space adapted for interviews and specialty sets.',
          },
        ],
      },
      led: {
        label: 'LED Walls',
        items: [
          {
            image: 'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?auto=format&fit=crop&w=1200&q=80',
            label: 'LED Walls',
            body:
              'LED volumes that reshape scenery in real time for full immersion.',
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
