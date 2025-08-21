import ServiciosProduccion from '@/components/ServiciosProduccion';
import SocialBanner from '@/components/SocialBanner';
import '@/styles/servicios.css';

export default function Page() {
  return (
    <>
      <ServiciosProduccion lang="es" />
      <SocialBanner lang="es" />
    </>
  );
}
