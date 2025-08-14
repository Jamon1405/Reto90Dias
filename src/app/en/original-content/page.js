import FadeInSection from '@/components/FadeInSection';
import ProduccionesDestacadas from '@/components/ProduccionesDestacadas';
import SeriesVerticales from '@/components/SeriesVerticales';

export default function Page() {
  return (
    <>
      <FadeInSection>
        <ProduccionesDestacadas lang="en" />
      </FadeInSection>
      <FadeInSection>
        <SeriesVerticales lang="en" />
      </FadeInSection>
    </>
  );
}
