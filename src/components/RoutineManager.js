'use client';
import { useState, useEffect } from 'react';
import useCurrentUser from '../hooks/useCurrentUser';

const weekdays = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

const RoutineManager = () => {
  const user = useCurrentUser();
  const [weekday, setWeekday] = useState('lunes');
  const [routineName, setRoutineName] = useState('');
  const [exercises, setExercises] = useState('');
  const [routines, setRoutines] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem(`weeklyRoutines_${user}`);
    setRoutines(saved ? JSON.parse(saved) : {});
  }, [user]);

  useEffect(() => {
    const handler = () => {
      const saved = localStorage.getItem(`weeklyRoutines_${user}`);
      setRoutines(saved ? JSON.parse(saved) : {});
    };
    window.addEventListener('routinesUpdated', handler);
    return () => window.removeEventListener('routinesUpdated', handler);
  }, [user]);

  const handleSave = () => {
    if (routineName.trim()) {
      const updated = { ...routines, [weekday]: { name: routineName, exercises } };
      setRoutines(updated);
      setRoutineName('');
      setExercises('');
      localStorage.setItem(`weeklyRoutines_${user}`, JSON.stringify(updated));
      window.dispatchEvent(new Event('routinesUpdated'));
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Agregar Rutina Semanal</h2>
      <select value={weekday} onChange={(e) => setWeekday(e.target.value)} style={inputStyle}>
        {weekdays.map((day) => (
          <option key={day} value={day}>
            {day.charAt(0).toUpperCase() + day.slice(1)}
          </option>
        ))}
      </select>
      <input
        style={inputStyle}
        value={routineName}
        onChange={(e) => setRoutineName(e.target.value)}
        placeholder="Nombre de la rutina"
      />
      <textarea
        style={{ ...inputStyle, height: '100px' }}
        value={exercises}
        onChange={(e) => setExercises(e.target.value)}
        placeholder="Ejercicios"
      />
      <button style={buttonStyle} onClick={handleSave}>
        Guardar Rutina
      </button>
      <h3 style={{ marginTop: '20px' }}>Rutinas Guardadas</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {weekdays.map((day) => (
          <li key={day} style={routineStyle}>
            <strong>{day.charAt(0).toUpperCase() + day.slice(1)}:</strong>{' '}
            {routines[day] ? (
              <>
                <span>{routines[day].name}</span>
                <p>{routines[day].exercises}</p>
              </>
            ) : (
              <span>Sin rutina</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

const containerStyle = {
  padding: '20px',
  maxWidth: '800px',
  margin: 'auto',
};

const headerStyle = {
  color: '#0288d1',
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '5px',
  border: '1px solid #ccc',
};

const buttonStyle = {
  backgroundColor: '#0288d1',
  color: '#fff',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const routineStyle = {
  backgroundColor: '#fff',
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '5px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

export default RoutineManager;
