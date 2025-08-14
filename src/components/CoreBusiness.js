import Image from 'next/image';
import styles from './CoreBusiness.module.css';

const content = {
  es: {
    title: 'Nuestro core business',
    items: [
      {
        title: 'Contenido Original',
        body:
          'Formatos que rompen esquemas: talent shows, realities, noticias y series para cada pantalla.',
        image: 'https://placehold.co/100x100?text=OC',
      },
      {
        title: 'Virtual Production',
        body:
          'Escenarios digitales y pantallas LED que impulsan la creatividad y reducen costos.',
        image: 'https://placehold.co/100x100?text=VP',
      },
      {
        title: 'Servicios de Producción 360',
        body:
          'Desde la idea hasta la entrega final con infraestructura y talento de primer nivel.',
        image: 'https://placehold.co/100x100?text=360',
      },
    ],
  },
  en: {
    title: 'Our core business',
    items: [
      {
        title: 'Original Content',
        body:
          'Formats that break the mold: talent shows, reality, news and series for every screen.',
        image: 'https://placehold.co/100x100?text=OC',
      },
      {
        title: 'Virtual Production',
        body:
          'Digital sets and LED stages that boost creativity while cutting costs.',
        image: 'https://placehold.co/100x100?text=VP',
      },
      {
        title: '360° Production Services',
        body:
          'From concept to delivery with top-tier infrastructure and talent.',
        image: 'https://placehold.co/100x100?text=360',
      },
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
            <li key={item.title} className={styles.item}>
              <Image
                src={item.image}
                alt=""
                width={80}
                height={80}
                className={styles.itemImage}
              />
              <div className={styles.itemCopy}>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.itemBody}>{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
