import styles from './VirtualProduction.module.css';

const content = {
  es: {
    title: 'Virtual Production',
    body: 'Producción de comerciales, telenovelas, series y videoclips con tecnología LED y entornos virtuales que optimizan tiempos y costos.',
    features: [
      'Escenarios LED de gran formato para rodajes inmersivos',
      'Integración en tiempo real de cámaras y motores 3D',
      'Flujos de trabajo eficientes que reducen costos de postproducción',
    ],
  },
  en: {
    title: 'Virtual Production',
    body: 'Production of commercials, soap operas, series and music videos with LED technology and virtual environments to optimize time and cost.',
    features: [
      'Large LED stages for immersive shoots',
      'Real-time integration between cameras and 3D engines',
      'Streamlined workflows that cut post-production expenses',
    ],
  },
};

export default function VirtualProduction({ lang = 'es' }) {
  const t = content[lang];
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{t.title}</h2>
      <p className={styles.body}>{t.body}</p>
      <ul className={styles.features}>
        {t.features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <video
        src="https://www.w3schools.com/html/mov_bbb.mp4"
        className={styles.video}
        controls
      />
    </section>
  );
}
