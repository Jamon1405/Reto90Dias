"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './AboutCarousel.module.css';

const content = {
  es: [
    {
      key: 'quienes',
      title: 'Quiénes somos',
      body:
        'En Light Channel vivimos para contar historias. Combinamos experiencia, tecnología y un equipo apasionado para producir contenidos que sorprenden y conectan con la audiencia. Con dos décadas en la industria, hemos acumulado más de 223,000 minutos en TV y 7,500 horas backstage, participando en giras y producciones de alto nivel. Nuestro equipo altamente capacitado y la tecnología más avanzada nos permiten ofrecer resultados impecables en cada proyecto.',
      image:
        'https://images.unsplash.com/photo-1556767576-cf9c4a1e4911?auto=format&fit=crop&w=1600&q=80',
    },
    {
      key: 'core',
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
      title: 'About us',
      body:
        'At Light Channel we live to tell stories. We blend experience, technology and passion to deliver content that engages and inspires. With two decades in the industry, we have amassed over 223,000 minutes on TV and 7,500 hours backstage, taking part in tours and high-level productions. Our highly trained team and cutting-edge technology allow us to deliver flawless results in every project.',
      image:
        'https://images.unsplash.com/photo-1556767576-cf9c4a1e4911?auto=format&fit=crop&w=1600&q=80',
    },
    {
      key: 'core',
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
      title: 'Our value proposition',
      body:
        'We turn ideas into memorable experiences. From pre to post production, our end-to-end approach delivers high-impact results.',
      image:
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
    },
  ],
};

export default function AboutCarousel({ lang = 'es' }) {
  const sections = content[lang];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % sections.length);
    }, 6000);
    return () => clearInterval(id);
  }, [sections.length]);

  return (
    <section className={styles.carousel}>
      {sections.map((s, i) => (
        <div
          key={s.key}
          className={i === index ? `${styles.slide} ${styles.active}` : styles.slide}
        >
          <Image src={s.image} alt={s.title} fill className={styles.image} />
          <div className={styles.overlay}>
            <h2 className={styles.title}>{s.title}</h2>
            {s.items ? (
              <ul className={styles.list}>
                {s.items.map((item) => (
                  <li key={item.title} className={styles.listItem}>
                    <h3 className={styles.itemTitle}>{item.title}</h3>
                    <p className={styles.itemBody}>{item.body}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.body}>{s.body}</p>
            )}
          </div>
        </div>
      ))}
      <div className={styles.dots}>
        {sections.map((_, i) => (
          <button
            key={i}
            className={i === index ? `${styles.dot} ${styles.activeDot}` : styles.dot}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

