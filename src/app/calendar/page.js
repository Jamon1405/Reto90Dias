import Calendar from '../../components/Calendar';  // Asegúrate de que la ruta es correcta

export default function CalendarPage() {
  return (
    <div className="container">
      <h1>Calendario de Entrenamiento</h1>
      <Calendar /> {/* Renderiza el componente del calendario */}
    </div>
  );
}
