'use client';
import React from 'react';

const content = {
  es: {
    title: 'Virtual Production',
    intro:
      'Combinamos escenarios digitales y pantallas LED para rodajes flexibles que mantienen la esencia de tu historia.',
    categories: [
      {
        label: 'Comerciales',
        body: 'Anuncios inmersivos en tiempo récord.',
      },
      {
        label: 'Running Shots',
        body: 'Vehículos en movimiento dentro de entornos virtuales realistas.',
      },
      {
        label: 'Telenovelas',
        body: 'Capítulos con fondos cambiantes sin trasladar al elenco.',
      },
      {
        label: 'Series',
        body: 'Mundos persistentes que ahorran tiempo de montaje.',
      },
      {
        label: 'Videoclips',
        body: 'Visuales audaces generados en tiempo real.',
      },
    ],
    benefits: [
      'Menos traslados, más tiempo de rodaje',
      'Control total de la luz y el clima',
      'Iteración creativa instantánea',
    ],
  },
  en: {
    title: 'Virtual Production',
    intro:
      'We blend digital environments and LED walls for flexible shoots that keep your story front and center.',
    categories: [
      {
        label: 'Commercials',
        body: 'Immersive ads delivered in record time.',
      },
      {
        label: 'Running Shots',
        body: 'Vehicles captured in lifelike virtual routes.',
      },
      {
        label: 'Soap Operas',
        body: 'Episodes with changing backdrops without moving the cast.',
      },
      {
        label: 'Series',
        body: 'Persistent worlds that save set‑up time.',
      },
      {
        label: 'Music Videos',
        body: 'Bold visuals rendered in real time.',
      },
    ],
    benefits: [
      'Fewer travel days, more shoot time',
      'Total control over light and weather',
      'Instant creative iteration',
    ],
  },
};

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/gi, '-');
}

export default function VirtualProduction({ lang = 'es' }) {
  const t = content[lang];
  return (
    <section className="virtual">
      {/* HERO */}
      <header className="section first">
        <div className="grid">
          <div
            className="img ph"
            role="img"
            aria-label="IMG/VIDEO-HERO 16:9 mínimo 1600×900"
          >
            {/* [IMG/VIDEO-HERO 16:9 mínimo 1600×900] */}
          </div>
          <div className="txt">
            <h1 className="h1">{t.title}</h1>
            <p className="p">{t.intro}</p>
            <ul className="benefits">
              {t.benefits.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      {t.categories.map((c, i) => {
        const slug = slugify(c.label);
        return (
          <section key={slug} id={slug} className="section">
            <div className={`grid${i % 2 ? ' swap' : ''}`}>
              <div className="img ph" role="img" aria-label={`IMG-${slug} 16:9`}>
                {/* [IMG-${slug} 16:9] */}
              </div>
              <div className="txt">
                <h2 className="h3">{c.label}</h2>
                <p className="p">{c.body}</p>
              </div>
            </div>
          </section>
        );
      })}
    </section>
  );
}
