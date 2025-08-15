"use client";

import { useState } from 'react';
import Image from 'next/image';
import styles from './AboutTabs.module.css';

const content = {
  es: [
    {
      key: 'quienes',
      tab: 'Quiénes somos',
      title: 'Quiénes somos',
      body:
        'En Light Channel vivimos para contar historias. Combinamos experiencia, tecnología y un equipo apasionado para producir contenidos que sorprenden y conectan con la audiencia. Con dos décadas en la industria, hemos acumulado más de 223,000 minutos en TV y 7,500 horas backstage, participando en giras y producciones de alto nivel. Nuestro equipo altamente capacitado y la tecnología más avanzada nos permiten ofrecer resultados impecables en cada proyecto.',
      image:
        'https://images.unsplash.com/photo-1581091870622-7d4b39ed64f0?auto=format&fit=crop&w=1600&q=80',
    },
    {
      key: 'core',
      tab: 'Nuestro core business',
      title: 'Nuestro core business',
      items: [
        {
          title: 'Contenido Original',
          body:
            'Formatos que rompen esquemas: talent shows, realities, noticias y series para cada pantalla.',
        },
        {
          title: 'Virtual Production',
          body:
            'Escenarios digitales y pantallas LED que impulsan la creatividad y reducen costos.',
        },
        {
          title: 'Servicios de Producción 360',
          body:
            'Desde la idea hasta la entrega final con infraestructura y talento de primer nivel.',
        },
      ],
      image:
        'https://images.unsplash.com/photo-1535185384036-9f18e86e5f5c?auto=format&fit=crop&w=1600&q=80',
    },
    {
      key: 'valor',
      tab: 'Nuestra propuesta de valor',
      title: 'Nuestra propuesta de valor',
      body:
        'Transformamos ideas en experiencias memorables. Desde la preproducción hasta la post, nuestro enfoque integral garantiza resultados de alto impacto.',
      image:
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
    },
  ],
  en: [
    {
      key: 'quienes',
      tab: 'About us',
      title: 'About us',
      body:
        'At Light Channel we live to tell stories. We blend experience, technology and passion to deliver content that engages and inspires. With two decades in the industry, we have amassed over 223,000 minutes on TV and 7,500 hours backstage, taking part in tours and high-level productions. Our highly trained team and cutting-edge technology allow us to deliver flawless results in every project.',
      image:
        'https://images.unsplash.com/photo-1581091870622-7d4b39ed64f0?auto=format&fit=crop&w=1600&q=80',
    },
    {
      key: 'core',
      tab: 'Our core business',
      title: 'Our core business',
      items: [
        {
          title: 'Original Content',
          body:
            'Formats that break the mold: talent shows, reality, news and series for every screen.',
        },
        {
          title: 'Virtual Production',
          body:
            'Digital sets and LED stages that boost creativity while cutting costs.',
        },
        {
          title: '360° Production Services',
          body:
            'From concept to delivery with top-tier infrastructure and talent.',
        },
      ],
      image:
        'https://images.unsplash.com/photo-1535185384036-9f18e86e5f5c?auto=format&fit=crop&w=1600&q=80',
    },
    {
      key: 'valor',
      tab: 'Our value proposition',
      title: 'Our value proposition',
      body:
        'We turn ideas into memorable experiences. From pre to post production, our end-to-end approach delivers high-impact results.',
      image:
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
    },
  ],
};

export default function AboutTabs({ lang = 'es' }) {
  const sections = content[lang];
  const [active, setActive] = useState(sections[0].key);
  const current = sections.find((s) => s.key === active);

  return (
    <section className={styles.about}>
      <div className={styles.tabs}>
        {sections.map((s) => (
          <button
            key={s.key}
            className={active === s.key ? styles.activeTab : styles.tab}
            onClick={() => setActive(s.key)}
          >
            {s.tab}
          </button>
        ))}
      </div>
      <div className={styles.content}>
        <div className={styles.text}>
          <h2 className={styles.title}>{current.title}</h2>
          {current.items ? (
            <ul className={styles.list}>
              {current.items.map((item) => (
                <li key={item.title} className={styles.listItem}>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <p className={styles.itemBody}>{item.body}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.body}>{current.body}</p>
          )}
        </div>
        <div className={styles.imageWrapper}>
          <Image
            src={current.image}
            alt={current.title}
            fill
            sizes="100vw"
            className={styles.image}
          />
        </div>
      </div>
    </section>
  );
}
