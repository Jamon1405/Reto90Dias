import Image from 'next/image';
import styles from './SeriesVerticales.module.css';

const content = {
  es: {
    title: 'Series verticales',
    items: [
      {
        title: '“El Secreto” — Suspenso en 9:16',
        image: 'https://placehold.co/360x640',
      },
      {
        title: '“Detrás del Reto” — Acceso exclusivo',
        image: 'https://placehold.co/360x640',
      },
    ],
  },
  en: {
    title: 'Vertical series',
    items: [
      {
        title: '“El Secreto” — 9:16 thriller',
        image: 'https://placehold.co/360x640',
      },
      {
        title: '“Behind the Challenge” — Exclusive access',
        image: 'https://placehold.co/360x640',
      },
    ],
  },
};

export default function SeriesVerticales({ lang = 'es' }) {
  const t = content[lang];
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{t.title}</h2>
      <ul className={styles.list}>
        {t.items.map((i) => (
          <li key={i.title} className={styles.item}>
            <Image
              src={i.image}
              alt={i.title}
              className={styles.image}
              width={360}
              height={640}
            />
            <p>{i.title}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
