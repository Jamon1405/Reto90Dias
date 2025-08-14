import FadeInSection from '@/components/FadeInSection';
import ServiciosProduccion from '@/components/ServiciosProduccion';
import Infraestructura from '@/components/Infraestructura';

export default function Page() {
  return (
    <>
      <FadeInSection>
        <ServiciosProduccion lang="en" />
      </FadeInSection>
      <FadeInSection>
        <Infraestructura lang="en" />
      </FadeInSection>
    </>
  );
}
