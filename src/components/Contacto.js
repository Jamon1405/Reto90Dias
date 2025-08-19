import Image from 'next/image';
import styles from './Contacto.module.css';

const content = {
  es: {
    title: 'Contacto',
    intro: 'Escríbenos a:',
    email: 'info@light-channel.com',
    addressTitle: 'Dirección:',
    address: 'Agustín M. Chávez 1, Santa Fe, CDMX',
  },
  en: {
    title: 'Contact',
    intro: 'Write to us at:',
    email: 'info@light-channel.com',
    addressTitle: 'Address:',
    address: 'Agustín M. Chávez 1, Santa Fe, Mexico City',
  },
};

export default function Contacto({ lang = 'es' }) {
  const t = content[lang];
  return (
    <section className={styles.section}>
      <Image
        src="https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=1600&q=80"
        alt="Contact us"
        className={styles.background}
        fill
        sizes="100vw"
      />
      <div className={styles.overlay}>
        <h2 className={styles.title}>{t.title}</h2>
        <p>{t.intro}</p>
        <p>
          <a className={styles.email} href={`mailto:${t.email}`}>{t.email}</a>
        </p>
        <p className={styles.addressTitle}>{t.addressTitle}</p>
        <p>{t.address}</p>
        <div className={styles.mapWrapper}>
          <iframe
            className={styles.map}
            src="https://maps.google.com/maps?q=Agust%C3%ADn%20M.%20Ch%C3%A1vez%201%2C%20Santa%20Fe%2C%20CDMX&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
