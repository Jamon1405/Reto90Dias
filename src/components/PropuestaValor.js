import styles from './PropuestaValor.module.css';

export default function PropuestaValor() {
  return (
    <section id="propuesta-valor" className={styles.section}>
      <h2 className={styles.title}>Propuesta de valor</h2>
      <div className={styles.content}>
        <img src="https://via.placeholder.com/800x400?text=Valor" alt="Propuesta de valor" />
        <p>
          Ofrecemos soluciones creativas, eficientes y alineadas a las
          necesidades de cada cliente, garantizando resultados memorables.
        </p>
      </div>
    </section>
  );
}
