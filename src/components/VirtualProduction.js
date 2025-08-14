import styles from './VirtualProduction.module.css';

const content = {
  es: {
    title: 'Virtual Production',
    body:
      'Creamos mundos digitales con volúmenes LED, cámaras sincronizadas y flujos remotos que aceleran la producción sin sacrificar creatividad.',
    features: [
      'Volúmenes LED de última generación',
      'Integración en tiempo real con motores 3D',
      'Colaboración remota para decisiones instantáneas',
    ],
  },
  en: {
    title: 'Virtual Production',
    body:
      'We build digital worlds with LED volumes, synced cameras and remote workflows that speed up production without losing creativity.',
    features: [
      'Next‑gen LED volumes',
      'Real‑time integration with 3D engines',
      'Remote collaboration for instant decisions',
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
          <p className={styles.body}>{t.body}</p>
          <ul className={styles.features}>
            {t.features.map((f) => (
              <li key={f}>{f}</li>
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
