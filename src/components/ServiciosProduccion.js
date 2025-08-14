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
          {
            icon: '🗂️',
            label: 'Coordinación logística',
            body: 'Planeación de recursos, casting y manejo de locaciones.',
          },
          {
            icon: '🎬',
            label: 'Diseño de producción',
            body: 'Construcción de sets, vestuario y arte con estética cuidada.',
          },
        ],
      },
      post: {
        label: 'Post Producción',
        items: [
          {
            icon: '✂️',
            label: 'Edición',
            body: 'Montaje narrativo y ritmo acorde al proyecto.',
          },
          {
            icon: '🎨',
            label: 'Corrección de color',
            body: 'Grading profesional para un look cinematográfico.',
          },
          {
            icon: '🧩',
            label: 'VFX',
            body: 'Composición digital y gráficos en 3D.',
          },
          {
            icon: '🔊',
            label: 'Diseño de audio',
            body: 'Mezcla, foley y masterización para múltiples formatos.',
          },
        ],
      },
      led: {
        label: 'Pantallas LED',
        items: [
          {
            image: 'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?auto=format&fit=crop&w=1200&q=80',
            label: 'Muros LED',
            body:
              'Paneles de alta resolución que transforman el escenario en tiempo real.',
          },
          {
            icon: '🖥️',
            label: 'Servidores de control',
            body: 'Procesadores Brompton y Disguise para sincronía perfecta.',
          },
          {
            icon: '🌐',
            label: 'Escenarios virtuales',
            body: 'Integración de entornos 3D en vivo con seguimiento de cámara.',
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
            body: 'Seasoned camera, sound and lighting operators.',
          },
          {
            icon: '🗂️',
            label: 'Logistics coordination',
            body: 'Resource planning, casting and location management.',
          },
          {
            icon: '🎬',
            label: 'Production design',
            body: 'Set building, wardrobe and art with meticulous aesthetics.',
          },
        ],
      },
      post: {
        label: 'Post Production',
        items: [
          {
            icon: '✂️',
            label: 'Editing',
            body: 'Narrative cutting and pacing tailored to each project.',
          },
          {
            icon: '🎨',
            label: 'Color grading',
            body: 'Professional grading for a cinematic look.',
          },
          {
            icon: '🧩',
            label: 'VFX',
            body: '3D graphics and digital compositing.',
          },
          {
            icon: '🔊',
            label: 'Sound design',
            body: 'Mixing, foley and mastering for multiple formats.',
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
              'High‑resolution panels reshaping scenery in real time for full immersion.',
          },
          {
            icon: '🖥️',
            label: 'Control servers',
            body: 'Brompton and Disguise processors for perfect sync.',
          },
          {
            icon: '🌐',
            label: 'Virtual backdrops',
            body: 'Live 3D environments with camera tracking integration.',
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
