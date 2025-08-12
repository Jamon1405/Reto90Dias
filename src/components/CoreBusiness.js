import styles from './CoreBusiness.module.css';

export default function CoreBusiness() {
  return (
    <section id="core-business" className={styles.section}>
      <h2 className={styles.title}>Nuestro core business</h2>
      <ul className={styles.list}>
        <li>
          <strong>Contenido Original</strong> – Creación y desarrollo de formatos innovadores:
          talent shows, realities, noticieros, ficción, series verticales y más.
        </li>
        <li>
          <strong>Virtual Production</strong> – Producción de comerciales, telenovelas, series y
          videoclips con tecnología LED y entornos virtuales que optimizan tiempos y costos.
        </li>
        <li>
          <strong>Servicios de Producción 360</strong> – Soluciones integrales que incluyen
          preproducción, rodaje y postproducción, con acceso a estudios, foros, pantallas LED,
          equipo técnico y humano.
        </li>
      </ul>
    </section>
  );
}
