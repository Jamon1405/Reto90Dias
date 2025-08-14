import Image from 'next/image';
import styles from './ProduccionesDestacadas.module.css';

const content = {
  es: {
    title: 'Producciones destacadas',
    items: [
      {
        title: '“El Reto de Creadores” — YouTube Originals',
        image: 'https://placehold.co/800x450',
      },
      {
        title: '“Mamá ya es mi Casa” — TelevisaUnivision',
        image: 'https://placehold.co/800x450',
      },
      {
        title: '“Tengo Talento, Mucho Talento” — Estrella TV',
        image: 'https://placehold.co/800x450',
      },
      {
        title: '“Alarma TV” — Estrella TV',
        image: 'https://placehold.co/800x450',
      },
    ],
  },
  en: {
    title: 'Featured productions',
    items: [
      {
        title: '“El Reto de Creadores” — YouTube Originals',
        image: 'https://placehold.co/800x450',
      },
      {
        title: '“Mamá ya es mi Casa” — TelevisaUnivision',
        image: 'https://placehold.co/800x450',
      },
      {
        title: '“Tengo Talento, Mucho Talento” — Estrella TV',
        image: 'https://placehold.co/800x450',
      },
      {
        title: '“Alarma TV” — Estrella TV',
        image: 'https://placehold.co/800x450',
      },
    ],
  },
};

export default function ProduccionesDestacadas({ lang = 'es' }) {
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
              width={800}
              height={450}
            />
            <p>{i.title}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
