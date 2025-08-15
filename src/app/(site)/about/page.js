import FadeInSection from '@/components/FadeInSection';
import QuienesSomos from '@/components/QuienesSomos';
import CoreBusiness from '@/components/CoreBusiness';
import PropuestaValor from '@/components/PropuestaValor';
import AboutHighlights from '@/components/AboutHighlights';

export default function Page() {
  return (
    <>
      <FadeInSection>
        <QuienesSomos lang="es" />
      </FadeInSection>
      <FadeInSection>
        <CoreBusiness lang="es" />
      </FadeInSection>
      <FadeInSection>
        <PropuestaValor lang="es" />
      </FadeInSection>
      <FadeInSection>
        <AboutHighlights lang="es" />
      </FadeInSection>
    </>
  );
}
