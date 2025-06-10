'use client';
import { useState, useEffect } from 'react';
import { TOTAL_DAYS, START_DATE } from '../constants';
import useCurrentUser from '../hooks/useCurrentUser';

const weekdays = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

const Calendar = () => {
  const user = useCurrentUser();
  const [selectedDay, setSelectedDay] = useState(null);
  const [days, setDays] = useState(() =>
    new Array(TOTAL_DAYS).fill({ completed: false })
  );
  const [weeklyRoutines, setWeeklyRoutines] = useState({});
  const startDate = new Date(START_DATE);

  useEffect(() => {
    const savedDays = localStorage.getItem(`calendarDays_${user}`);
    setDays(savedDays ? JSON.parse(savedDays) : new Array(TOTAL_DAYS).fill({ completed: false }));
    const routines = localStorage.getItem(`weeklyRoutines_${user}`);
    setWeeklyRoutines(routines ? JSON.parse(routines) : {});
  }, [user]);

  useEffect(() => {
    const handler = () => {
      const routines = localStorage.getItem(`weeklyRoutines_${user}`);
      setWeeklyRoutines(routines ? JSON.parse(routines) : {});
    };
    window.addEventListener('routinesUpdated', handler);
    return () => window.removeEventListener('routinesUpdated', handler);
  }, [user]);

  useEffect(() => {
    localStorage.setItem(`calendarDays_${user}`, JSON.stringify(days));
  }, [days, user]);

  const handleCompleteDay = () => {
    if (selectedDay !== null) {
      setDays((prev) => {
        const updated = [...prev];
        updated[selectedDay].completed = true;
        return updated;
      });
    }
  };

  const handleResetProgress = () => {
    const reset = new Array(TOTAL_DAYS).fill({ completed: false });
    setDays(reset);
    localStorage.removeItem(`calendarDays_${user}`);
    setSelectedDay(null);
  };

  const renderRoutine = (date) => {
    const dayName = weekdays[date.getDay()];
    const routine = weeklyRoutines[dayName];
    if (!routine) return <p>No hay rutina para este día</p>;
    return (
      <div>
        <h4>{routine.name}</h4>
        <p>{routine.exercises}</p>
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Calendario de 60 días</h2>
      <div style={gridStyle}>
        {days.map((day, index) => {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + index);
          return (
            <div
              key={index}
              style={dayBoxStyle(day, selectedDay === index)}
              onClick={() => setSelectedDay(index)}
            >
              {date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
              <br />
              {weekdays[date.getDay()]}
            </div>
          );
        })}
      </div>
      {selectedDay !== null && (
        <div style={{ marginTop: '20px' }}>
          {renderRoutine(new Date(startDate.getTime() + selectedDay * 86400000))}
          {!days[selectedDay].completed && (
            <button style={buttonStyle} onClick={handleCompleteDay}>
              Marcar día completado
            </button>
          )}
        </div>
      )}
      <button style={{ ...buttonStyle, marginTop: '20px' }} onClick={handleResetProgress}>
        Reiniciar progreso
      </button>
    </div>
  );
};

const containerStyle = {
  padding: '20px',
  backgroundColor: '#f0f0f0',
  borderRadius: '15px',
  margin: 'auto',
  textAlign: 'center',
  maxWidth: '1000px',
};

const headerStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '20px',
};

const dayBoxStyle = (day, selected) => ({
  padding: '10px',
  margin: '5px',
  borderRadius: '8px',
  cursor: 'pointer',
  backgroundColor: day.completed ? '#4caf50' : '#e0e0e0',
  boxShadow: selected ? '0px 0px 15px rgba(0, 0, 0, 0.2)' : 'none',
});

const buttonStyle = {
  backgroundColor: '#0288d1',
  color: '#fff',
  padding: '12px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  margin: '10px 5px',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '10px',
};

export default Calendar;
