import { useEffect, useRef } from 'react';
import styles from './SeriesVerticales.module.css';

const series = [
  { id: 1, src: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'Serie 1' },
  { id: 2, src: 'https://www.youtube.com/embed/oHg5SJYRHA0', title: 'Serie 2' },
  { id: 3, src: 'https://www.youtube.com/embed/3GwjfUFyY6M', title: 'Serie 3' },
];

export default function SeriesVerticales() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const items = Array.from(container.children);
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      {series.map((video) => (
        <div key={video.id} className={styles.item}>
          <iframe
            className={styles.video}
            src={video.src}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <div className={styles.overlay}>▶</div>
        </div>
      ))}
    </div>
  );
}
