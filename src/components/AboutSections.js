"use client";

import Image from 'next/image';
import Link from 'next/link';
import styles from './AboutSections.module.css';

const content = {
  es: {
    title: 'Sobre nosotros',
    blocks: [
      {
        key: 'quienes',
        title: 'Quiénes somos',
        body:
          'Con dos décadas en la industria, hemos acumulado más de 223,000 minutos en TV y 7,500 horas backstage, participando en giras y producciones de alto nivel. Nuestro equipo altamente capacitado y la tecnología más avanzada nos permiten ofrecer resultados impecables en cada proyecto.',
        image:
          'https://images.unsplash.com/photo-1556767576-cf9c4a1e4911?auto=format&fit=crop&w=1600&q=80',
        cta: 'Conoce más',
        href: '/contacto',
      },
      {
        key: 'core',
        title: 'Nuestro core business',
        body:
          'Impulsamos la producción con contenido original, virtual production y servicios 360° que transforman ideas en experiencias memorables.',
        image:
          'https://images.unsplash.com/photo-1535185384036-9f18e86e5f5c?auto=format&fit=crop&w=1600&q=80',
        cta: 'Ver servicios',
        href: '/servicios',
      },
      {
        key: 'valor',
        title: 'Nuestra propuesta de valor',
        body:
          'Transformamos ideas en experiencias memorables. Desde la preproducción hasta la post, nuestro enfoque integral garantiza resultados de alto impacto.',
        image:
          'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
        cta: 'Contáctanos',
        href: '/contacto',
      },
    ],
  },
  en: {
    title: 'About us',
    blocks: [
      {
        key: 'quienes',
        title: 'Who we are',
        body:
          'With two decades in the industry, we have amassed over 223,000 minutes on TV and 7,500 backstage hours in high-level productions. Our trained team and cutting-edge technology ensure flawless results every time.',
        image:
          'https://images.unsplash.com/photo-1556767576-cf9c4a1e4911?auto=format&fit=crop&w=1600&q=80',
        cta: 'Learn more',
        href: '/en/contact',
      },
      {
        key: 'core',
        title: 'Our core business',
        body:
          'We drive production through original content, virtual production and 360° services that turn ideas into memorable experiences.',
        image:
          'https://images.unsplash.com/photo-1535185384036-9f18e86e5f5c?auto=format&fit=crop&w=1600&q=80',
        cta: 'View services',
        href: '/en/production-services',
      },
      {
        key: 'valor',
        title: 'Our value proposition',
        body:
          'We transform ideas into memorable experiences. From pre to post production, our end-to-end approach delivers high impact results.',
        image:
          'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
        cta: 'Contact us',
        href: '/en/contact',
      },
    ],
  },
};

export default function AboutSections({ lang = 'es' }) {
  const { title, blocks } = content[lang];
  return (
    <section className={styles.wrapper}>
      <h1 className={styles.mainTitle}>{title}</h1>
      {blocks.map((block) => (
        <div key={block.key} className={styles.block}>
          <Image src={block.image} alt={block.title} fill className={styles.image} />
          <div className={styles.overlay}>
            <h2 className={styles.title}>{block.title}</h2>
            <p className={styles.body}>{block.body}</p>
            <Link href={block.href} className={styles.button}>
              {block.cta}
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}

