import styles from './Contacto.module.css';

const content = {
  es: {
    title: 'Contacto',
      intro: 'Escríbenos a:',
      phone: 'Tel: +1 555 0100',
      location: 'Ciudad de México',
  },
  en: {
    title: 'Contact',
      intro: 'Write to us at:',
      phone: 'Tel: +1 555 0100',
      location: 'Mexico City',
  },
};

export default function Contacto({ lang = 'es' }) {
  const t = content[lang];
  return (
    <section className={styles.section}>
      <img
        src="https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=1600&q=80"
        alt="Contact us"
        className={styles.background}
        loading="lazy"
      />
      <div className={styles.overlay}>
        <h2 className={styles.title}>{t.title}</h2>
        <p>{t.intro}</p>
          <ul className={styles.list}>
            <li>
              <a href="mailto:mth@light-channel.com">mth@light-channel.com</a>
            </li>
            <li>
              <a href="mailto:mbatz@light-channel.com">mbatz@light-channel.com</a>
            </li>
          </ul>
          <p>{t.phone}</p>
          <p>{t.location}</p>
      </div>
    </section>
  );
}
