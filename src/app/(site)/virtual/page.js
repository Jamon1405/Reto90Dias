'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';

// Local bilingual copy
const copy = {
  es: {
    uploadVideo: 'Sube tu video a /public/virtual-sizzle.mp4',
    heroTitle: 'Producción Virtual, sin fricción.',
    heroSubtitle: 'Rodamos mundos reales e imaginarios sin salir del foro.',
    ctaDemo: 'Ver demo (60s)',
    ctaQuote: 'Cotizar proyecto',
    benefits: [
      {
        title: 'Menos traslados, más rodaje.',
        body: 'Reduce logística y tiempos.',
      },
      {
        title: 'Luz y clima bajo control.',
        body: 'Golden hour, cuando quieras.',
      },
      {
        title: 'Iteración creativa al instante.',
        body: 'Cambia set y cámara en tiempo real.',
      },
    ],
    demoChips: [
      { label: 'Comerciales', time: 5 }, // TODO: ajustar timestamps
      { label: 'Series', time: 18 },
      { label: 'Videoclips', time: 32 },
      { label: 'Running shots', time: 45 },
    ],
    howSteps: [
      { title: 'Previz', body: 'look dev, arte y pruebas en Unreal.' },
      { title: 'Rodaje', body: 'muro LED, tracking y playback sincronizado.' },
      { title: 'Post', body: 'ajustes finos, color y comp ligera.' },
    ],
    useCases: [
      {
        label: 'Comerciales',
        body: 'Anuncios inmersivos en tiempo récord.',
      },
      {
        label: 'Running shots',
        body: 'Vehículos en movimiento dentro de entornos virtuales realistas.',
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
      {
        title: 'Less travel, more shooting.',
        body: 'Cut logistics and time.',
      },
      {
        title: 'Light and weather under control.',
        body: 'Golden hour, on demand.',
      },
      {
        title: 'Instant creative iteration.',
        body: 'Change set and camera in real time.',
      },
    ],
    demoChips: [
      { label: 'Commercials', time: 5 }, // TODO: adjust timestamps
      { label: 'Series', time: 18 },
      { label: 'Music videos', time: 32 },
      { label: 'Running shots', time: 45 },
    ],
    howSteps: [
      { title: 'Previz', body: 'look dev, art and tests in Unreal.' },
      { title: 'Shoot', body: 'LED wall, tracking and synced playback.' },
      { title: 'Post', body: 'fine tweaks, color and light comp.' },
    ],
    useCases: [
      {
        label: 'Commercials',
        body: 'Immersive ads delivered in record time.',
      },
      {
        label: 'Running shots',
        body: 'Vehicles captured in lifelike virtual routes.',
      },
      {
        label: 'Series',
        body: 'Persistent worlds that save set-up time.',
      },
      {
        label: 'Music videos',
        body: 'Bold visuals rendered in real time.',
      },
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
    <>
      <Hero t={t} isEN={isEN} />
      <Benefits t={t} />
      <Demo t={t} />
      <HowItWorks t={t} />
      <UseCasesAccordion t={t} />
      <SpecsRow t={t} />
      <TestimonialCta t={t} lang={lang} />
    </>
  );
}

// Hero section with background video and optional language switch
function Hero({ t, isEN }) {
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
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
    <section className="relative flex items-center justify-center py-12 md:py-24">
      <div className="absolute top-4 right-4">
        <Link
          href={isEN ? '/virtual' : '/en/virtual'}
          className="text-sm text-white underline hover:no-underline"
          aria-label={isEN ? 'Ver en español' : 'View in English'}
        >
          {isEN ? 'ES' : 'EN'}
        </Link>
      </div>
      {videoError ? (
        <div className="w-full aspect-video bg-gray-200 flex items-center justify-center rounded-xl">
          <p className="text-gray-600 text-sm md:text-base">{t('uploadVideo')}</p>
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
          onError={() => setVideoError(true)}
          className="w-full h-auto rounded-xl object-cover"
        >
          <source src="/virtual-sizzle.mp4" type="video/mp4" /> {/* TODO: ruta del video */}
        </video>
      )}
      <div className="absolute inset-0 bg-black/40 rounded-xl" aria-hidden="true"></div>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
        <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">{t('heroTitle')}</h1>
        <p className="mt-4 text-lg md:text-xl max-w-2xl drop-shadow">{t('heroSubtitle')}</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <a
            href="#demo"
            className="px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition"
          >
            {t('ctaDemo')}
          </a>
          <a
            href="#contact" // TODO: actualizar con enlace real de contacto
            className="px-6 py-3 bg-transparent border border-white rounded-full font-semibold hover:bg-white hover:text-black transition"
          >
            {t('ctaQuote')}
          </a>
        </div>
      </div>
    </section>
  );
}

// Benefits grid
function Benefits({ t }) {
  return (
    <section className="py-12 md:py-24 px-4">
      <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
        {t('benefits').map((b) => (
          <div
            key={b.title}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-6"
          >
            <h3 className="text-xl font-semibold mb-2">{b.title}</h3>
            <p className="text-base">{b.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// Demo video with chips
function Demo({ t }) {
  const videoRef = useRef(null);
  const [showControls, setShowControls] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const vid = videoRef.current;
    if (vid) {
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => setShowControls(true));
      }
    }
  }, []);

  const seekTo = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <section id="demo" className="py-12 md:py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {t('demoChips').map((chip) => (
            <button
              key={chip.label}
              onClick={() => seekTo(chip.time)}
              className="px-4 py-2 bg-gray-200 rounded-full text-sm hover:bg-gray-300 transition"
              aria-label={chip.label}
            >
              {chip.label}
            </button>
          ))}
        </div>
        {videoError ? (
          <div className="w-full aspect-video bg-gray-200 flex items-center justify-center rounded-xl">
            <p className="text-gray-600 text-sm md:text-base">{t('uploadVideo')}</p>
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
            onError={() => setVideoError(true)}
            className="w-full h-auto rounded-xl object-cover"
          >
            <source src="/virtual-sizzle.mp4" type="video/mp4" /> {/* TODO: ruta del video */}
          </video>
        )}
      </div>
    </section>
  );
}

// How it works steps
function HowItWorks({ t }) {
  return (
    <section className="py-12 md:py-24 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-3">
        {t('howSteps').map((step, idx) => (
          <div key={step.title} className="text-left">
            <div className="text-5xl font-bold text-gray-300">{idx + 1}</div>
            <h3 className="text-xl font-semibold mt-4 mb-2">{step.title}</h3>
            <p className="text-base">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// Use cases accordion
function UseCasesAccordion({ t }) {
  const [open, setOpen] = useState(null);
  const toggle = (idx) => setOpen(open === idx ? null : idx);

  return (
    <section className="py-12 md:py-24 px-4">
      <div className="max-w-3xl mx-auto divide-y">
        {t('useCases').map((item, idx) => (
          <div key={item.label}>
            <button
              className="w-full flex justify-between items-center py-4 text-left"
              onClick={() => toggle(idx)}
              aria-expanded={open === idx}
            >
              <span className="font-semibold">{item.label}</span>
              <span>{open === idx ? '-' : '+'}</span>
            </button>
            {open === idx && (
              <p className="pb-4 text-base">{item.body}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// Specs row
function SpecsRow({ t }) {
  return (
    <section className="py-12 md:py-24 px-4 bg-gray-50">
      <ul className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-center text-sm md:text-base">
        {t('specs').map((spec) => (
          <li key={spec} className="p-2">{spec}</li>
        ))}
      </ul>
    </section>
  );
}

// Testimonial and final CTA
function TestimonialCta({ t, lang }) {
  const contactHref = lang === 'en' ? '/en/contact' : '/contacto'; // TODO: reemplazar con enlace de contacto real
  return (
    <section id="contact" className="py-12 md:py-24 px-4 text-center">
      <p className="max-w-2xl mx-auto italic mb-8">{t('testimonial')}</p>
      <Link
        href={contactHref}
        className="inline-block px-6 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition"
      >
        {t('ctaFinal')}
      </Link>
    </section>
  );
}

