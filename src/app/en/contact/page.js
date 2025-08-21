import FadeInSection from '@/components/FadeInSection';
import Contacto from '@/components/Contacto';
import SocialBanner from '@/components/SocialBanner';

export default function Page() {
  return (
    <>
      <FadeInSection>
        <Contacto lang="en" />
      </FadeInSection>
      <SocialBanner lang="en" />
    </>
  );
}
