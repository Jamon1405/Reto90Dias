import { useRef, useState, useEffect } from 'react';
import styles from './FadeInSection.module.css';

export default function FadeInSection({ children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.section} ${visible ? styles.visible : ''}`}
    >
      {children}
    </div>
  );
}
