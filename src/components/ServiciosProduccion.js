'use client';

import { useEffect } from 'react';
import Link from 'next/link';

const content = {
  es: {
    hero: {
      title: 'Servicios de Producción',
      intro: '',
    },
    categories: [
      {
        slug: 'foros',
        title: 'Foros',
        forums: [
          {
            name: 'Estudio VP GGM Digital',
            specs: [
              '336 m² de espacio creativo',
              '7 metros de altura',
              'puente de iluminación',
              'Elephant Door para acceso de gran formato',
            ],
            description:
              'Ideal para producciones virtuales y proyectos de alto nivel técnico.',
          },
          {
            name: 'Estudio VP 7 Digital',
            specs: [
              'Foro de 14 x 10 metros',
              '6 metros de altura',
              'equipado con ciclorama',
            ],
            description:
              'Perfecto para sets virtuales, filmaciones y contenido digital de alta calidad.',
          },
          {
            name: 'Estudio UC',
            specs: [
              'Foro de 17 x 17 metros',
              '7 metros de altura',
              'con tramoya',
              'ubicado dentro de la Universidad de la Comunicación, en la Colonia Roma',
            ],
            description:
              'Un espacio versátil para conciertos, shows y producciones audiovisuales.',
          },
        ],
      },
      {
        slug: 'produccion',
        title: 'Producción',
        items: [
          {
            label: 'Equipo creativo',
            body: 'Guionistas, directores y productores que materializan tu visión.',
          },
          {
            label: 'Equipo técnico',
            body: 'Operadores de cámara, sonido e iluminación con experiencia en set.',
          },
          {
            label: 'Coordinación logística',
            body: 'Planeación de recursos, casting y manejo de locaciones.',
          },
          {
            label: 'Diseño de producción',
            body: 'Construcción de sets, vestuario y arte con estética cuidada.',
          },
        ],
      },
      {
        slug: 'post',
        title: 'Post Producción',
        items: [
          { label: 'Edición', body: 'Montaje narrativo y ritmo acorde al proyecto.' },
          {
            label: 'Corrección de color',
            body: 'Grading profesional para un look cinematográfico.',
          },
          { label: 'VFX', body: 'Composición digital y gráficos en 3D.' },
          {
            label: 'Diseño de audio',
            body: 'Mezcla, foley y masterización para múltiples formatos.',
          },
        ],
      },
      {
        slug: 'led',
        title: 'Pantallas LED',
        items: [
          {
            label: 'Pioneros en tecnología LED en México',
            body: 'Lideramos la innovación desde nuestros inicios, ofreciendo soluciones de iluminación con la más alta tecnología LED del mercado.',
          },
          {
            label: 'Inventario sin precedentes',
            body: 'Contamos con más de 150 millones de LEDs disponibles, listos para integrarse en proyectos de cualquier escala.',
          },
          { label: 'Muros LED', body: 'Paneles de alta resolución que transforman el escenario en tiempo real.' },
          {
            label: 'Servidores de control',
            body: 'Procesadores Brompton y Disguise para sincronía perfecta.',
          },
          {
            label: 'Escenarios virtuales',
            body: 'Integración de entornos 3D en vivo con seguimiento de cámara.',
          },
        ],
      },
    ],
  },
  en: {
    hero: {
      title: 'Production Services',
      intro: '',
    },
    categories: [
      {
        slug: 'stages',
        title: 'Stages',
        forums: [
          {
            name: 'VP GGM Digital Studio',
            specs: [
              '336 m² of creative space',
              '7 m high ceiling',
              'lighting bridge',
              'elephant door for large-format access',
            ],
            description:
              'Ideal for virtual productions and technically demanding projects.',
          },
          {
            name: 'VP 7 Digital Studio',
            specs: [
              '14 x 10 m stage',
              '6 m height',
              'cyclorama equipped',
            ],
            description:
              'Perfect for virtual sets, shoots and high-quality digital content.',
          },
          {
            name: 'UC Studio',
            specs: [
              '17 x 17 m stage',
              '7 m height',
              'rigging',
              'located inside the University of Communication in Colonia Roma',
            ],
            description:
              'A versatile space for concerts, shows and audiovisual productions.',
          },
        ],
      },
      {
        slug: 'production',
        title: 'Production',
        items: [
          {
            label: 'Creative team',
            body: 'Writers, directors and producers bringing your vision to life.',
          },
          {
            label: 'Technical crew',
            body: 'Seasoned camera, sound and lighting operators.',
          },
          {
            label: 'Logistics coordination',
            body: 'Resource planning, casting and location management.',
          },
          {
            label: 'Production design',
            body: 'Set building, wardrobe and art with meticulous aesthetics.',
          },
        ],
      },
      {
        slug: 'post',
        title: 'Post Production',
        items: [
          { label: 'Editing', body: 'Narrative cutting and pacing tailored to each project.' },
          {
            label: 'Color grading',
            body: 'Professional grading for a cinematic look.',
          },
          { label: 'VFX', body: '3D graphics and digital compositing.' },
          {
            label: 'Sound design',
            body: 'Mixing, foley and mastering for multiple formats.',
          },
        ],
      },
      {
        slug: 'led',
        title: 'LED Walls',
        items: [
          {
            label: 'Pioneers in LED technology in Mexico',
            body: 'We have led innovation from the start, offering lighting solutions with the highest LED technology in the market.',
          },
          {
            label: 'Unrivaled inventory',
            body: 'More than 150 million LEDs ready to integrate into projects of any scale.',
          },
          { label: 'LED Walls', body: 'High‑resolution panels reshaping scenery in real time for full immersion.' },
          {
            label: 'Control servers',
            body: 'Brompton and Disguise processors for perfect sync.',
          },
          {
            label: 'Virtual backdrops',
            body: 'Live 3D environments with camera tracking integration.',
          },
        ],
      },
    ],
  },
};

export default function ServiciosProduccion({ lang = 'es' }) {
  const t = content[lang];
  const labels = {
    es: { gallery: 'Galería', video: 'Video' },
    en: { gallery: 'Gallery', video: 'Video' },
  }[lang];

  useEffect(() => {
    const opens = document.querySelectorAll('[data-open]');
    const closes = document.querySelectorAll('[data-close]');
    const modals = document.querySelectorAll('.modal');
    const onOpen = (e) => {
      const sel = e.currentTarget.getAttribute('data-open');
      const modal = document.querySelector(sel);
      if (modal) modal.classList.add('open');
    };
    const onClose = (e) => {
      const sel = e.currentTarget.getAttribute('data-close');
      const modal = document.querySelector(sel);
      if (modal) modal.classList.remove('open');
    };
    const onOverlay = (e) => {
      if (e.target.classList.contains('modal')) {
        e.target.classList.remove('open');
      }
    };
    opens.forEach((b) => b.addEventListener('click', onOpen));
    closes.forEach((b) => b.addEventListener('click', onClose));
    modals.forEach((m) => m.addEventListener('click', onOverlay));
    return () => {
      opens.forEach((b) => b.removeEventListener('click', onOpen));
      closes.forEach((b) => b.removeEventListener('click', onClose));
      modals.forEach((m) => m.removeEventListener('click', onOverlay));
    };
  }, [lang]);

  return (
    <section className="servicios">
      {/* HERO */}
      <header className="section">
        <h1 className="h1">{t.hero.title}</h1>
        {t.hero.intro && <p className="p">{t.hero.intro}</p>}
      </header>
      {/* SECCIONES */}
      {t.categories.map((c, idx) => {
        if (c.slug === 'foros' || c.slug === 'stages') {
          return (
            <section key={c.slug} id={c.slug} className="section">
              <h2 className="h2">{c.title}</h2>
              <div className="forum-thumbs">
                {c.forums.map((f, i) => {
                  const slug = `${c.slug}-${i}`;
                  return (
                    <button
                      key={slug}
                      className="forum-thumb ph"
                      data-open={`#modal-${slug}`}
                      aria-label={f.name}
                    >
                      {/* [IMG-FORO-{slug} 16:9] */}
                      <span>{f.name}</span>
                    </button>
                  );
                })}
              </div>
              {c.forums.map((f, i) => {
                const slug = `${c.slug}-${i}`;
                return (
                  <div
                    key={slug}
                    id={`modal-${slug}`}
                    className="modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={`modaltitle-${slug}`}
                  >
                    <div className="modal-card">
                      <h3 id={`modaltitle-${slug}`} className="h3">
                        {f.name}
                      </h3>
                      <p className="p">{f.description}</p>
                      <ul>
                        {f.specs.map((s) => (
                          <li key={s} className="p">
                            {s}
                          </li>
                        ))}
                      </ul>
                      <h4 className="modal-subtitle">{labels.gallery}</h4>
                      <div className="ph" aria-label={`Galería ${f.name}`}>
                        [{labels.gallery.toUpperCase()}]
                      </div>
                      <h4 className="modal-subtitle">{labels.video}</h4>
                      <div className="ph" aria-label={`Video ${f.name}`}>
                        [{labels.video.toUpperCase()}]
                      </div>
                      <button className="button" data-close={`#modal-${slug}`}>
                        {lang === 'es' ? 'Cerrar' : 'Close'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </section>
          );
        }

        return (
          <section key={c.slug} id={c.slug} className="section">
            <div className={`grid ${idx % 2 === 1 ? 'swap' : ''}`}>
              <div className="img ph" aria-label={`Imagen sección ${c.title}`}>
                {/* [IMG-${c.slug} 16:9] */}
              </div>
              <div className="txt">
                <h2 className="h2">{c.title}</h2>
                <ul>
                  {c.items.map((it) => (
                    <li key={it.label} className="p">
                      <strong>{it.label}</strong> {it.body}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA FINAL */}
      <section className="section">
        <div className="grid">
          <div className="txt">
            <h3 className="h2">
              {lang === 'es' ? 'Trabajemos juntos' : "Let's work together"}
            </h3>
            <Link
              href={lang === 'es' ? '/contacto' : '/en/contact'}
              className="button"
            >
              {lang === 'es' ? 'Contáctanos' : 'Contact us'}
            </Link>
          </div>
        </div>
      </section>
    </section>
  );
}

