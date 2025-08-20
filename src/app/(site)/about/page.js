import Link from 'next/link';
import '@/styles/about.css';

export default function Page() {
  return (
    <section className="about">
      {/* HERO */}
      <header className="hero">
        <h1 className="h1">Sobre nosotros</h1>
      </header>

      {/* BLOQUE 1 */}
      <section className="section">
        <div className="grid">
          <div className="img img-ph" role="img" aria-label="IMG-01 16:9 mínimo 1600×900 — backstage/control room">
            {/* [IMG-01 16:9 mínimo 1600×900 — backstage/control room] */}
          </div>
          <div className="txt">
            <h3 className="h3">Quiénes somos</h3>
            <p className="p">
              Con dos décadas en la industria, hemos acumulado más de 223,000 minutos en TV y 7,500 horas backstage, participando en giras y producciones de alto nivel. Nuestro equipo altamente capacitado y la tecnología más avanzada nos permiten ofrecer resultados impecables en cada proyecto.
            </p>
            <Link href="/contacto" className="button">
              Conoce más
            </Link>
          </div>
        </div>
      </section>

      {/* BLOQUE 2 */}
      <section className="section">
        <div className="grid swap">
          <div className="img img-ph" role="img" aria-label="IMG-02 16:9 — set virtual / pantallas LED / contenido original">
            {/* [IMG-02 16:9 — set virtual / pantallas LED / contenido original] */}
          </div>
          <div className="txt">
            <h3 className="h3">Nuestro core business</h3>
            <p className="p">
              Impulsamos la producción con contenido original, virtual production y servicios 360° que transforman ideas en experiencias memorables.
            </p>
            <Link href="/servicios" className="button">
              Ver servicios
            </Link>
          </div>
        </div>
      </section>

      {/* BLOQUE 3 */}
      <section className="section">
        <div className="grid">
          <div className="img img-ph" role="img" aria-label="IMG-03 16:9 — producción 360°: pre/rodaje/post">
            {/* [IMG-03 16:9 — producción 360°: pre/rodaje/post] */}
          </div>
          <div className="txt">
            <h3 className="h3">Nuestra propuesta de valor</h3>
            <p className="p">
              Transformamos ideas en experiencias memorables. Desde la preproducción hasta la post, nuestro enfoque integral garantiza resultados de alto impacto.
            </p>
            <Link href="/contacto" className="button">
              Contáctanos
            </Link>
          </div>
        </div>
      </section>

      {/* CTA PRE-FOOTER */}
      <section className="section">
        <div className="txt center">
          <h3 className="h3">Trabajemos juntos</h3>
          <Link href="/contacto" className="button">
            Contáctanos
          </Link>
        </div>
      </section>
    </section>
  );
}

