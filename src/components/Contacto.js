import styles from './Contacto.module.css';

const content = {
  es: {
    title: 'Contacto',
    intro: 'Escríbenos a:',
  },
  en: {
    title: 'Contact',
    intro: 'Write to us at:',
  },
};

export default function Contacto({ lang = 'es' }) {
  const t = content[lang];
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{t.title}</h2>
      <div className={styles.content}>
        <p>{t.intro}</p>
        <ul className={styles.list}>
          <li>
            <a href="mailto:mth@light-channel.com">mth@light-channel.com</a>
          </li>
          <li>
            <a href="mailto:mbatz@light-channel.com">mbatz@light-channel.com</a>
          </li>
        </ul>
      </div>
      <img
        src="https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=1200&q=80"
        alt="Contact us"
        className={styles.image}
        loading="lazy"
      />
    </section>
  );
}
