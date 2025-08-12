import styles from './Contacto.module.css';

export default function Contacto() {
  return (
    <section id="contacto" className={styles.section}>
      <h2 className={styles.title}>Contacto</h2>
      <div className={styles.content}>
        <p>Escríbenos a:</p>
        <ul className={styles.list}>
          <li><a href="mailto:mth@light-channel.com">mth@light-channel.com</a></li>
          <li><a href="mailto:mbatz@light-channel.com">mbatz@light-channel.com</a></li>
        </ul>
      </div>
    </section>
  );
}
