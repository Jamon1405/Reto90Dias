import Link from 'next/link';
import '@/styles/about.css';

export default function Page() {
  return (
    <section className="about">
      {/* HERO */}
      <header className="hero">
        <h1 className="h1">About us</h1>
      </header>

      {/* BLOCK 1 */}
      <section className="section">
        <div className="grid">
          <div className="img img-ph" role="img" aria-label="IMG-01 16:9 minimum 1600×900 — backstage/control room">
            {/* [IMG-01 16:9 minimum 1600×900 — backstage/control room] */}
          </div>
          <div className="txt">
            <h3 className="h3">Who we are</h3>
            <p className="p">
              With two decades in the industry, we have amassed over 223,000 minutes on TV and 7,500 backstage hours in high-level productions. Our trained team and cutting-edge technology ensure flawless results every time.
            </p>
            <Link href="/en/contact" className="button">
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* BLOCK 2 */}
      <section className="section">
        <div className="grid swap">
          <div className="img img-ph" role="img" aria-label="IMG-02 16:9 — virtual set / LED screens / original content">
            {/* [IMG-02 16:9 — virtual set / LED screens / original content] */}
          </div>
          <div className="txt">
            <h3 className="h3">Our core business</h3>
            <p className="p">
              We drive production through original content, virtual production and 360° services that turn ideas into memorable experiences.
            </p>
            <Link href="/en/production-services" className="button">
              View services
            </Link>
          </div>
        </div>
      </section>

      {/* BLOCK 3 */}
      <section className="section">
        <div className="grid">
          <div className="img img-ph" role="img" aria-label="IMG-03 16:9 — 360° production: pre/production/post">
            {/* [IMG-03 16:9 — 360° production: pre/production/post] */}
          </div>
          <div className="txt">
            <h3 className="h3">Our value proposition</h3>
            <p className="p">
              We transform ideas into memorable experiences. From pre to post production, our end-to-end approach delivers high impact results.
            </p>
            <Link href="/en/contact" className="button">
              Contact us
            </Link>
          </div>
        </div>
      </section>

    </section>
  );
}

