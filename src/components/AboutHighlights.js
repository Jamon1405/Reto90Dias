import Image from 'next/image';
import styles from './AboutHighlights.module.css';

const content = {
  es: {
    items: [
      {
        image: 'https://images.unsplash.com/photo-1581092335193-3f96dc1c96a2?auto=format&fit=crop&w=800&q=80',
        title: 'Capacidad',
        body: 'Más de 223,000 minutos en TV y 7,500 horas backstage.',
      },
      {
        image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981d?auto=format&fit=crop&w=800&q=80',
        title: 'Innovación',
        body: 'Tecnología LED y procesos de vanguardia.',
      },
      {
        image: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=800&q=80',
        title: 'Modernismo',
        body: 'Estética contemporánea y herramientas digitales avanzadas.',
      },
    ],
  },
  en: {
    items: [
      {
        image: 'https://images.unsplash.com/photo-1581092335193-3f96dc1c96a2?auto=format&fit=crop&w=800&q=80',
        title: 'Capacity',
        body: 'Over 223,000 minutes on TV and 7,500 hours backstage.',
      },
      {
        image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981d?auto=format&fit=crop&w=800&q=80',
        title: 'Innovation',
        body: 'Cutting-edge LED technology and workflows.',
      },
      {
        image: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=800&q=80',
        title: 'Modernity',
        body: 'Contemporary aesthetics and advanced digital tools.',
      },
    ],
  },
};

export default function AboutHighlights({ lang = 'es' }) {
  const t = content[lang];
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {t.items.map((item) => (
          <div key={item.title} className={styles.card}>
            <Image
              src={item.image}
              alt={item.title}
              className={styles.image}
              width={400}
              height={300}
            />
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.cardBody}>{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
