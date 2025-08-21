'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';

// Localized copy in Spanish and English
const copy = {
  es: {
    uploadVideo: 'Sube tu video a /public/virtual-sizzle.mp4',
    heroTitle: 'Producción Virtual, sin fricción.',
    heroSubtitle: 'Rodamos mundos reales e imaginarios sin salir del foro.',
    ctaDemo: 'Ver demo (60s)',
    ctaQuote: 'Cotizar proyecto',
    benefits: [
      ['Menos traslados, más rodaje.', 'Reduce logística y tiempos.'],
      ['Luz y clima bajo control.', 'Golden hour, cuando quieras.'],
      ['Iteración creativa al instante.', 'Cambia set y cámara en tiempo real.'],
    ],
    demoChips: [
      { label: 'Comerciales', time: 5 }, // TODO: ajustar timestamps
      { label: 'Series', time: 18 },
      { label: 'Videoclips', time: 32 },
      { label: 'Running shots', time: 45 },
    ],
    steps: [
      ['Previz', 'look dev, arte y pruebas en Unreal.'],
      ['Rodaje', 'muro LED, tracking y playback sincronizado.'],
      ['Post', 'ajustes finos, color y comp ligera.'],
    ],
    useCases: [
      ['Comerciales', 'Anuncios inmersivos en tiempo récord.'],
      ['Running shots', 'Vehículos en movimiento dentro de entornos virtuales realistas.'],
      ['Series', 'Mundos persistentes que ahorran tiempo de montaje.'],
      ['Videoclips', 'Visuales audaces generados en tiempo real.'],
    ],
    specs: [
      'Foro LED',
      'Pixel pitch (— mm)',
      'Brillo máx (— nits)',
      'Tracking (—)',
      'Cámaras (—)',
    ],
    testimonial: '“Producción ágil y resultados impecables.” — Nombre, Cargo.',
    ctaFinal: 'Cuéntanos tu proyecto →',
  },
  en: {
    uploadVideo: 'Upload your video to /public/virtual-sizzle.mp4',
    heroTitle: 'Virtual Production, frictionless.',
    heroSubtitle: 'We shoot real and imaginary worlds without leaving the stage.',
    ctaDemo: 'Watch demo (60s)',
    ctaQuote: 'Get a quote',
    benefits: [
      ['Less travel, more shooting.', 'Cut logistics and time.'],
      ['Light and weather under control.', 'Golden hour, on demand.'],
      ['Instant creative iteration.', 'Change set and camera in real time.'],
    ],
    demoChips: [
      { label: 'Commercials', time: 5 }, // TODO: adjust timestamps
      { label: 'Series', time: 18 },
      { label: 'Music videos', time: 32 },
      { label: 'Running shots', time: 45 },
    ],
    steps: [
      ['Previz', 'look dev, art and tests in Unreal.'],
      ['Shoot', 'LED wall, tracking and synced playback.'],
      ['Post', 'fine tweaks, color and light comp.'],
    ],
    useCases: [
      ['Commercials', 'Immersive ads delivered in record time.'],
      ['Running shots', 'Vehicles captured in lifelike virtual routes.'],
      ['Series', 'Persistent worlds that save set-up time.'],
      ['Music videos', 'Bold visuals rendered in real time.'],
    ],
    specs: [
      'LED stage',
      'Pixel pitch (— mm)',
      'Max brightness (— nits)',
      'Tracking (—)',
      'Cameras (—)',
    ],
    testimonial: '“Agile production and impeccable results.” — Name, Title.',
    ctaFinal: 'Tell us about your project →',
  },
};

export default function VirtualPage() {
  const pathname = usePathname();
  const isEN = pathname?.startsWith('/en');
  const lang = isEN ? 'en' : 'es';
  const t = (key) => copy[lang][key];

  return (
    <div className="space-y-24">
      <Hero t={t} />
      <Benefits t={t} />
      <Demo t={t} />
      <Workflow t={t} />
      <UseCases t={t} />
      <Specs t={t} />
      <FinalCTA t={t} lang={lang} />
    </div>
  );
}

// Hero with background video and overlay text
function Hero({ t }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const vid = videoRef.current;
    if (vid) {
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => setShowControls(true));
      }
    }
  }, []);

  return (
    <section className="relative mx-auto w-full max-w-6xl px-4">
      {error ? (
        <div className="aspect-video w-full rounded-xl bg-gray-200 flex items-center justify-center">
          <p className="text-sm text-gray-600 md:text-base">{t('uploadVideo')}</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          controls={showControls}
          controlsList="nodownload noremoteplayback"
          poster="/virtual-sizzle.jpg" // TODO: reemplazar con poster real
          onError={() => setError(true)}
          className="aspect-video w-full rounded-xl object-cover"
        >
          <source src="/virtual-sizzle.mp4" type="video/mp4" /> {/* TODO: ruta del video */}
        </video>
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
        <h1 className="text-4xl font-bold md:text-6xl">{t('heroTitle')}</h1>
        <p className="mt-4 max-w-2xl text-lg md:text-xl">{t('heroSubtitle')}</p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <a
            href="#demo"
            className="rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200"
          >
            {t('ctaDemo')}
          </a>
          <a
            href="#contact" // TODO: enlazar a sección o mail de contacto real
            className="rounded-full border border-white px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-black"
          >
            {t('ctaQuote')}
          </a>
        </div>
      </div>
      <div className="absolute inset-0 rounded-xl bg-black/40" aria-hidden="true" />
    </section>
  );
}

// Three benefit tiles
function Benefits({ t }) {
  return (
    <section className="mx-auto max-w-6xl px-4" aria-labelledby="benefits-title">
      <h2 id="benefits-title" className="sr-only">
        Beneficios
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {t('benefits').map(([title, body]) => (
          <div
            key={title}
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <h3 className="mb-2 text-xl font-semibold">{title}</h3>
            <p className="text-base">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// Demo video with timestamp chips
function Demo({ t }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const vid = videoRef.current;
    if (vid) {
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => setShowControls(true));
      }
    }
  }, []);

  const seek = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <section id="demo" className="mx-auto max-w-4xl px-4" aria-labelledby="demo-title">
      <h2 id="demo-title" className="sr-only">
        Demo
      </h2>
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {t('demoChips').map((chip) => (
          <button
            key={chip.label}
            onClick={() => seek(chip.time)}
            className="rounded-full bg-gray-200 px-4 py-2 text-sm transition hover:bg-gray-300"
            aria-label={chip.label}
          >
            {chip.label}
          </button>
        ))}
      </div>
      {error ? (
        <div className="aspect-video w-full rounded-xl bg-gray-200 flex items-center justify-center">
          <p className="text-sm text-gray-600 md:text-base">{t('uploadVideo')}</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          controls={showControls}
          controlsList="nodownload noremoteplayback"
          poster="/virtual-sizzle.jpg" // TODO: reemplazar con poster real
          onError={() => setError(true)}
          className="aspect-video w-full rounded-xl object-cover"
        >
          <source src="/virtual-sizzle.mp4" type="video/mp4" /> {/* TODO: ruta del video */}
        </video>
      )}
    </section>
  );
}

// How it works steps
function Workflow({ t }) {
  return (
    <section className="mx-auto max-w-6xl px-4" aria-labelledby="workflow-title">
      <h2 id="workflow-title" className="sr-only">
        Cómo funciona
      </h2>
      <div className="grid gap-8 md:grid-cols-3">
        {t('steps').map(([title, body], i) => (
          <div key={title} className="text-left">
            <div className="text-5xl font-bold text-gray-300">{i + 1}</div>
            <h3 className="mt-4 mb-2 text-xl font-semibold">{title}</h3>
            <p className="text-base">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// Compact accordion of use cases
function UseCases({ t }) {
  const [open, setOpen] = useState(null);
  const toggle = (idx) => setOpen(open === idx ? null : idx);

  return (
    <section className="mx-auto max-w-3xl px-4" aria-labelledby="usecases-title">
      <h2 id="usecases-title" className="sr-only">
        Casos de uso
      </h2>
      <div className="divide-y">
        {t('useCases').map(([label, body], idx) => (
          <div key={label}>
            <button
              onClick={() => toggle(idx)}
              className="flex w-full items-center justify-between py-4 text-left"
              aria-expanded={open === idx}
            >
              <span className="font-semibold">{label}</span>
              <span>{open === idx ? '-' : '+'}</span>
            </button>
            {open === idx && <p className="pb-4 text-base">{body}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

// Specs listed in a single row
function Specs({ t }) {
  return (
    <section className="mx-auto max-w-6xl px-4" aria-labelledby="specs-title">
      <h2 id="specs-title" className="sr-only">
        Specs
      </h2>
      <ul className="grid gap-4 text-center text-sm sm:grid-cols-2 md:grid-cols-5 md:text-base">
        {t('specs').map((spec) => (
          <li key={spec} className="p-2">
            {spec}
          </li>
        ))}
      </ul>
    </section>
  );
}

// Testimonial and final call to action
function FinalCTA({ t, lang }) {
  const contactHref = lang === 'en' ? '/en/contact' : '/contacto'; // TODO: actualizar con enlace real de contacto
  return (
    <section id="contact" className="mx-auto max-w-3xl px-4 text-center">
      <p className="mx-auto mb-8 max-w-2xl italic">{t('testimonial')}</p>
      <Link
        href={contactHref}
        className="inline-block rounded-full bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
      >
        {t('ctaFinal')}
      </Link>
    </section>
  );
}

