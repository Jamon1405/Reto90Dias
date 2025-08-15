import Image from 'next/image';
import styles from './QuienesSomos.module.css';

const content = {
  es: {
    title: 'Quiénes somos',
    body:
      'En Light Channel vivimos para contar historias. Combinamos experiencia, tecnología y un equipo apasionado para producir contenidos que sorprenden y conectan con la audiencia. Con dos décadas en la industria, hemos acumulado más de 223,000 minutos en TV y 7,500 horas backstage, participando en giras y producciones de alto nivel. Nuestro equipo altamente capacitado y la tecnología más avanzada nos permiten ofrecer resultados impecables en cada proyecto.',
    image:
      'https://images.unsplash.com/photo-1581091870622-7d4b39ed64f0?auto=format&fit=crop&w=1600&q=80',
  },
  en: {
    title: 'About us',
    body:
      'At Light Channel we live to tell stories. We blend experience, technology and passion to deliver content that engages and inspires. With two decades in the industry, we have amassed over 223,000 minutes on TV and 7,500 hours backstage, taking part in tours and high-level productions. Our highly trained team and cutting-edge technology allow us to deliver flawless results in every project.',
    image:
      'https://images.unsplash.com/photo-1581091870622-7d4b39ed64f0?auto=format&fit=crop&w=1600&q=80',
  },
};

export default function QuienesSomos({ lang = 'es' }) {
  const t = content[lang];
  return (
    <section className={styles.section}>
      <Image
        src={t.image}
        alt={t.title}
        className={styles.background}
        fill
        sizes="100vw"
      />
      <div className={styles.overlay}>
        <h2 className={styles.title}>{t.title}</h2>
        <p className={styles.text}>{t.body}</p>
      </div>
    </section>
  );
}
