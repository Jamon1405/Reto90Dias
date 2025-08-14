import Image from 'next/image';
import styles from './CoreBusiness.module.css';

const content = {
  es: {
    title: 'Nuestro core business',
    items: [
      '<strong>Contenido Original</strong> – Formatos que rompen esquemas: talent shows, realities, noticias y series para cada pantalla.',
      '<strong>Virtual Production</strong> – Escenarios digitales y pantallas LED que impulsan la creatividad y reducen costos.',
      '<strong>Servicios de Producción 360</strong> – Desde la idea hasta la entrega final con infraestructura y talento de primer nivel.',
    ],
  },
  en: {
    title: 'Our core business',
    items: [
      '<strong>Original Content</strong> – Formats that break the mold: talent shows, reality, news and series for every screen.',
      '<strong>Virtual Production</strong> – Digital sets and LED stages that boost creativity while cutting costs.',
      '<strong>360° Production Services</strong> – From concept to delivery with top-tier infrastructure and talent.',
    ],
  },
};

export default function CoreBusiness({ lang = 'es' }) {
  const t = content[lang];
  return (
    <section className={styles.section}>
      <Image
        src="https://images.unsplash.com/photo-1535185384036-9f18e86e5f5c?auto=format&fit=crop&w=1600&q=80"
        alt="Production control room"
        className={styles.background}
        fill
        sizes="100vw"
      />
      <div className={styles.overlay}>
        <h2 className={styles.title}>{t.title}</h2>
        <ul className={styles.list}>
          {t.items.map((item) => (
            <li key={item} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      </div>
    </section>
  );
}
