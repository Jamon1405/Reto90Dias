import FadeInSection from '@/components/FadeInSection';
import QuienesSomos from '@/components/QuienesSomos';
import PropuestaValor from '@/components/PropuestaValor';
import EquipoDirectivo from '@/components/EquipoDirectivo';

export default function Page() {
  return (
    <>
      <FadeInSection>
        <QuienesSomos lang="es" />
      </FadeInSection>
      <FadeInSection>
        <PropuestaValor lang="es" />
      </FadeInSection>
      <FadeInSection>
        <EquipoDirectivo lang="es" />
      </FadeInSection>
    </>
  );
}
