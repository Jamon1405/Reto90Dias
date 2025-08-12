import FadeInSection from '@/components/FadeInSection';
import CoreBusiness from '@/components/CoreBusiness';
import Infraestructura from '@/components/Infraestructura';
import ProduccionesDestacadas from '@/components/ProduccionesDestacadas';

export default function Page() {
  return (
    <>
      <FadeInSection>
        <CoreBusiness lang="es" />
      </FadeInSection>
      <FadeInSection>
        <Infraestructura lang="es" />
      </FadeInSection>
      <FadeInSection>
        <ProduccionesDestacadas lang="es" />
      </FadeInSection>
    </>
  );
}
