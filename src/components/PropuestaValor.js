'use client';
import FadeInSection from './FadeInSection';

const PropuestaValor = () => {
  const sectionStyle = {
    backgroundImage: "url('https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1600&q=80')",
    backgroundAttachment: 'fixed',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    padding: '100px 20px',
    color: 'white',
    textAlign: 'center',
  };

  const overlayStyle = {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: '50px',
  };

  const listStyle = {
    listStyle: 'none',
    padding: 0,
    marginTop: '20px',
  };

  return (
    <section style={sectionStyle}>
      <div style={overlayStyle}>
        <FadeInSection>
          <h2>Propuesta de Valor</h2>
        </FadeInSection>
        <ul style={listStyle}>
          <FadeInSection delay={100}>
            <li>Resultados medibles en 90 días</li>
          </FadeInSection>
          <FadeInSection delay={200}>
            <li>Acompañamiento integral</li>
          </FadeInSection>
          <FadeInSection delay={300}>
            <li>Soporte profesional 24/7</li>
          </FadeInSection>
        </ul>
      </div>
    </section>
  );
};

export default PropuestaValor;
