"use client";
import styles from './SocialBanner.module.css';
import FadeInSection from './FadeInSection';
import { FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';

const content = {
  es: {
    follow: 'Síguenos',
    links: [
      {
        label: 'Instagram',
        href: 'https://www.instagram.com/_lightchannel/',
        Icon: FaInstagram,
      },
      {
        label: 'YouTube',
        href: 'https://www.youtube.com/@LightChannelMex',
        Icon: FaYoutube,
      },
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/company/light-channel/posts/?feedView=all',
        Icon: FaLinkedin,
      },
    ],
  },
  en: {
    follow: 'Follow us',
    links: [
      {
        label: 'Instagram',
        href: 'https://www.instagram.com/_lightchannel/',
        Icon: FaInstagram,
      },
      {
        label: 'YouTube',
        href: 'https://www.youtube.com/@LightChannelMex',
        Icon: FaYoutube,
      },
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/company/light-channel/posts/?feedView=all',
        Icon: FaLinkedin,
      },
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

