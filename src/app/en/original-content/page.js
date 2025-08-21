import FadeInSection from '@/components/FadeInSection';
import ProduccionesDestacadas from '@/components/ProduccionesDestacadas';
import SeriesVerticales from '@/components/SeriesVerticales';
import SocialBanner from '@/components/SocialBanner';

export default function Page() {
  return (
    <>
      <FadeInSection>
        <ProduccionesDestacadas lang="en" />
      </FadeInSection>
      <FadeInSection>
        <SeriesVerticales lang="en" />
      </FadeInSection>
      <SocialBanner lang="en" />
    </>
  );
}
