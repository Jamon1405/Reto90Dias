import styles from './ProduccionesDestacadas.module.css';

export default function ProduccionesDestacadas() {
  return (
    <section id="producciones-destacadas" className={styles.section}>
      <h2 className={styles.title}>Producciones destacadas</h2>
      <div className={styles.content}>
        <img src="https://via.placeholder.com/800x400?text=Producciones" alt="Producciones destacadas" />
        <p>
          Nuestra experiencia incluye largometrajes, series documentales y
          campañas publicitarias para marcas internacionales.
        </p>
      </div>
    </section>
  );
}
