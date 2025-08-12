'use client';
import { FaUsers, FaAward } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import FadeInSection from './FadeInSection';

const AnimatedCounter = ({ target }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const step = target / 50;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setCount(Math.floor(current));
    }, 30);
    return () => clearInterval(interval);
  }, [target]);

  return <span>{count}+</span>;
};

const QuienesSomos = () => {
  const sectionStyle = {
    backgroundImage: "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80')",
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

  const metricsStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '40px',
    marginTop: '20px',
    flexWrap: 'wrap',
  };

  return (
    <section style={sectionStyle}>
      <div style={overlayStyle}>
        <FadeInSection>
          <h2>¿Quiénes Somos?</h2>
        </FadeInSection>
        <FadeInSection delay={100}>
          <p>Somos una empresa comprometida con el bienestar y la salud.</p>
        </FadeInSection>
        <div style={metricsStyle}>
          <FadeInSection delay={200}>
            <div>
              <FaAward size={40} />
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                <AnimatedCounter target={25} /> años
              </div>
            </div>
          </FadeInSection>
          <FadeInSection delay={300}>
            <div>
              <FaUsers size={40} />
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                <AnimatedCounter target={100} /> clientes
              </div>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
};

export default QuienesSomos;
