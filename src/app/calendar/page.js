import Calendar from '../../components/Calendar';  // Asegúrate de que la ruta es correcta

export default function CalendarPage() {
  return (
    <div style={{ transform: 'scale(0.95)', transformOrigin: 'top center' }}>
      <h1>Calendario de Entrenamiento</h1>
      <Calendar /> {/* Renderiza el componente del calendario */}
    </div>
  );
}
