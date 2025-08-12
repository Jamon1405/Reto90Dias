import FadeInSection from '@/components/FadeInSection';
import CoreBusiness from '@/components/CoreBusiness';
import Infraestructura from '@/components/Infraestructura';
import ProduccionesDestacadas from '@/components/ProduccionesDestacadas';

export default function Page() {
  return (
    <>
      <FadeInSection>
        <CoreBusiness lang="en" />
      </FadeInSection>
      <FadeInSection>
        <Infraestructura lang="en" />
      </FadeInSection>
      <FadeInSection>
        <ProduccionesDestacadas lang="en" />
      </FadeInSection>
    </>
  );
}
