import QuienesSomos from '../components/QuienesSomos';
import CoreBusiness from '../components/CoreBusiness';
import Infraestructura from '../components/Infraestructura';
import ProduccionesDestacadas from '../components/ProduccionesDestacadas';
import PropuestaValor from '../components/PropuestaValor';
import EquipoDirectivo from '../components/EquipoDirectivo';
import Contacto from '../components/Contacto';

export default function HomePage() {
  return (
    <>
      <QuienesSomos />
      <CoreBusiness />
      <Infraestructura />
      <ProduccionesDestacadas />
      <PropuestaValor />
      <EquipoDirectivo />
      <Contacto />
    </>
  );
}
