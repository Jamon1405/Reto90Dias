"use client";
import styles from './SocialBanner.module.css';

const content = {
  es: {
    follow: 'Síguenos',
    links: [
      { label: 'Instagram', href: '#' },
      { label: 'YouTube', href: '#' },
      { label: 'Facebook', href: '#' },
    ],
  },
  en: {
    follow: 'Follow us',
    links: [
      { label: 'Instagram', href: '#' },
      { label: 'YouTube', href: '#' },
      { label: 'Facebook', href: '#' },
    ],
  },
};

export default function SocialBanner({ lang = 'es' }) {
  const t = content[lang];
  return (
    <div className={styles.banner}>
      <span className={styles.label}>{t.follow}</span>
      <ul className={styles.list}>
        {t.links.map((l) => (
          <li key={l.label}>
            <a href={l.href} target="_blank" rel="noopener noreferrer">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

