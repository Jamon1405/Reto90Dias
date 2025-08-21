import FadeInSection from '@/components/FadeInSection';
import EquipoDirectivo from '@/components/EquipoDirectivo';
import SocialBanner from '@/components/SocialBanner';

export default function Page() {
  return (
    <>
      <FadeInSection>
        <EquipoDirectivo lang="es" />
      </FadeInSection>
      <SocialBanner lang="es" />
    </>
  );
}
