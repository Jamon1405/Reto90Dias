import FadeInSection from '@/components/FadeInSection';
import QuienesSomos from '@/components/QuienesSomos';
import CoreBusiness from '@/components/CoreBusiness';
import PropuestaValor from '@/components/PropuestaValor';

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
    </>
  );
}
