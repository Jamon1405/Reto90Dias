"use client";
import styles from './SocialBanner.module.css';
import FadeInSection from './FadeInSection';
import { FaInstagram, FaYoutube, FaFacebook } from 'react-icons/fa';

const content = {
  es: {
    follow: 'Síguenos',
    links: [
      { label: 'Instagram', href: '#', Icon: FaInstagram },
      { label: 'YouTube', href: '#', Icon: FaYoutube },
      { label: 'Facebook', href: '#', Icon: FaFacebook },
    ],
  },
  en: {
    follow: 'Follow us',
    links: [
      { label: 'Instagram', href: '#', Icon: FaInstagram },
      { label: 'YouTube', href: '#', Icon: FaYoutube },
      { label: 'Facebook', href: '#', Icon: FaFacebook },
    ],
  },
};

export default function SocialBanner({ lang = 'es' }) {
  const t = content[lang];
  return (
    <FadeInSection>
      <div className={styles.banner}>
        <span className={styles.label}>{t.follow}</span>
        <ul className={styles.list}>
          {t.links.map(({ label, href, Icon }) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noopener noreferrer" className={styles.link}>
                <Icon className={styles.icon} />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </FadeInSection>
  );
}

