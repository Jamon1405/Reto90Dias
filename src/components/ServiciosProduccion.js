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
            label: 'Estudio VP GGM Digital',
            body:
              '336 m² de espacio creativo con 7 metros de altura, puente de iluminación y Elephant Door para acceso de gran formato. Ideal para producciones virtuales y proyectos de alto nivel técnico.',
          },
          {
            image:
              'https://images.unsplash.com/photo-1581276879432-15a63d16c6ac?auto=format&fit=crop&w=1200&q=80',
            label: 'Estudio VP 7 Digital',
            body:
              'Foro de 14 x 10 metros y 6 metros de altura, equipado con ciclorama. Perfecto para sets virtuales, filmaciones y contenido digital de alta calidad.',
          },
          {
            image:
              'https://images.unsplash.com/photo-1582711012124-a41f0c40e605?auto=format&fit=crop&w=1200&q=80',
            label: 'Estudio UC',
            body:
              'Foro de 17 x 17 metros y 7 metros de altura, con tramoya y ubicado dentro de la Universidad de la Comunicación, en la Colonia Roma. Un espacio versátil para conciertos, shows y producciones audiovisuales.',
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
            icon: '🚀',
            label: 'Pioneros en tecnología LED en México',
            body:
              'Lideramos la innovación desde nuestros inicios, ofreciendo soluciones de iluminación con la más alta tecnología LED del mercado.',
          },
          {
            icon: '📦',
            label: 'Inventario sin precedentes',
            body:
              'Contamos con más de 150 millones de LEDs disponibles, listos para integrarse en proyectos de cualquier escala.',
          },
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
            label: 'VP GGM Digital Studio',
            body:
              '336 m² of creative space with 7 m high ceiling, lighting bridge and elephant door for large-format access. Ideal for virtual productions and technically demanding projects.',
          },
          {
            image:
              'https://images.unsplash.com/photo-1581276879432-15a63d16c6ac?auto=format&fit=crop&w=1200&q=80',
            label: 'VP 7 Digital Studio',
            body:
              '14 x 10 m stage with 6 m height and cyclorama. Perfect for virtual sets, shoots and high-quality digital content.',
          },
          {
            image:
              'https://images.unsplash.com/photo-1582711012124-a41f0c40e605?auto=format&fit=crop&w=1200&q=80',
            label: 'UC Studio',
            body:
              '17 x 17 m stage with 7 m height and rigging, located inside the University of Communication in Colonia Roma. A versatile space for concerts, shows and audiovisual productions.',
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
            icon: '🚀',
            label: 'Pioneers in LED technology in Mexico',
            body:
              'We have led innovation from the start, offering lighting solutions with the highest LED technology in the market.',
          },
          {
            icon: '📦',
            label: 'Unrivaled inventory',
            body:
              'More than 150 million LEDs ready to integrate into projects of any scale.',
          },
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
              className={`${styles.mainTab} ${tab === key ? styles.mainTabActive : ''}`}
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
