import styles from './CoreBusiness.module.css';

export default function CoreBusiness() {
  return (
    <section id="core-business" className={styles.section}>
      <h2 className={styles.title}>Core Business</h2>
      <div className={styles.content}>
        <img src="https://via.placeholder.com/800x400?text=Core+Business" alt="Servicios principales" />
        <p>
          Nos especializamos en producción, postproducción y distribución de
          piezas audiovisuales para cine, televisión y plataformas digitales.
        </p>
      </div>
    </section>
  );
}
