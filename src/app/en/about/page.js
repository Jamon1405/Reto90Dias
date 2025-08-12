import FadeInSection from '@/components/FadeInSection';
import QuienesSomos from '@/components/QuienesSomos';
import CoreBusiness from '@/components/CoreBusiness';
import PropuestaValor from '@/components/PropuestaValor';

export default function Page() {
  return (
    <>
      <FadeInSection>
        <QuienesSomos lang="en" />
      </FadeInSection>
      <FadeInSection>
        <CoreBusiness lang="en" />
      </FadeInSection>
      <FadeInSection>
        <PropuestaValor lang="en" />
      </FadeInSection>
    </>
  );
}
