import FadeInSection from '@/components/FadeInSection';
import ProduccionesDestacadas from '@/components/ProduccionesDestacadas';
import SeriesVerticales from '@/components/SeriesVerticales';

export default function Page() {
  return (
    <>
      <FadeInSection>
        <ProduccionesDestacadas lang="es" />
      </FadeInSection>
      <FadeInSection>
        <SeriesVerticales lang="es" />
      </FadeInSection>
    </>
  );
}
