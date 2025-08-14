import styles from './VirtualProduction.module.css';

const content = {
  es: {
    title: 'Virtual Production',
    intro:
      'Combinamos escenarios digitales y pantallas LED para rodajes flexibles que mantienen la esencia de tu historia.',
    categories: [
      {
        label: 'Comerciales',
        body: 'Anuncios inmersivos en tiempo récord.',
      },
      {
        label: 'Running Shots',
        body: 'Vehículos en movimiento dentro de entornos virtuales realistas.',
      },
      {
        label: 'Telenovelas',
        body: 'Capítulos con fondos cambiantes sin trasladar al elenco.',
      },
      {
        label: 'Series',
        body: 'Mundos persistentes que ahorran tiempo de montaje.',
      },
      {
        label: 'Videoclips',
        body: 'Visuales audaces generados en tiempo real.',
      },
    ],
    benefits: [
      'Menos traslados, más tiempo de rodaje',
      'Control total de la luz y el clima',
      'Iteración creativa instantánea',
    ],
  },
  en: {
    title: 'Virtual Production',
    intro:
      'We blend digital environments and LED walls for flexible shoots that keep your story front and center.',
    categories: [
      {
        label: 'Commercials',
        body: 'Immersive ads delivered in record time.',
      },
      {
        label: 'Running Shots',
        body: 'Vehicles captured in lifelike virtual routes.',
      },
      {
        label: 'Soap Operas',
        body: 'Episodes with changing backdrops without moving the cast.',
      },
      {
        label: 'Series',
        body: 'Persistent worlds that save set‑up time.',
      },
      {
        label: 'Music Videos',
        body: 'Bold visuals rendered in real time.',
      },
    ],
    benefits: [
      'Fewer travel days, more shoot time',
      'Total control over light and weather',
      'Instant creative iteration',
    ],
  },
};

export default function VirtualProduction({ lang = 'es' }) {
  const t = content[lang];
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <div>
          <h2 className={styles.title}>{t.title}</h2>
          <p className={styles.body}>{t.intro}</p>
          <ul className={styles.categories}>
            {t.categories.map((c) => (
              <li key={c.label} className={styles.category}>
                <h3 className={styles.categoryTitle}>{c.label}</h3>
                <p>{c.body}</p>
              </li>
            ))}
          </ul>
          <ul className={styles.features}>
            {t.benefits.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        <video
          src="https://www.w3schools.com/html/mov_bbb.mp4"
          className={styles.video}
          controls
        />
      </div>
    </section>
  );
}
