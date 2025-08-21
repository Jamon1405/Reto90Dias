import FadeInSection from '@/components/FadeInSection';
import EquipoDirectivo from '@/components/EquipoDirectivo';
import SocialBanner from '@/components/SocialBanner';

export default function Page() {
  return (
    <>
      <FadeInSection>
        <EquipoDirectivo lang="en" />
      </FadeInSection>
      <SocialBanner lang="en" />
    </>
  );
}
