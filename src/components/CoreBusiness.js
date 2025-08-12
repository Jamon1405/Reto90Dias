'use client';
import FadeInSection from './FadeInSection';

const CoreBusiness = () => {
  const sectionStyle = {
    backgroundImage: "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80')",
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
          <h2>Core Business</h2>
        </FadeInSection>
        <ul style={listStyle}>
          <FadeInSection delay={100}>
            <li>Desarrollo de programas personalizados</li>
          </FadeInSection>
          <FadeInSection delay={200}>
            <li>Asesoramiento nutricional</li>
          </FadeInSection>
          <FadeInSection delay={300}>
            <li>Seguimiento de progreso continuo</li>
          </FadeInSection>
        </ul>
      </div>
    </section>
  );
};

export default CoreBusiness;
