import FadeInSection from '@/components/FadeInSection';
import ServiciosProduccion from '@/components/ServiciosProduccion';
import Infraestructura from '@/components/Infraestructura';

export default function Page() {
  return (
    <>
      <FadeInSection>
        <ServiciosProduccion lang="es" />
      </FadeInSection>
      <FadeInSection>
        <Infraestructura lang="es" />
      </FadeInSection>
    </>
  );
}
