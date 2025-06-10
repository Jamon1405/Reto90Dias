'use client';
import { useState, useEffect } from 'react';
import { TOTAL_DAYS } from '../constants';

const RoutineManager = () => {
  const [routineName, setRoutineName] = useState('');
  const [exercises, setExercises] = useState('');
  const [routines, setRoutines] = useState([]);
  const [day, setDay] = useState('');

  const getUser = () =>
    (typeof window !== 'undefined' && localStorage.getItem('selectedUser')) ||
    'ximena';

  useEffect(() => {
    const saved = localStorage.getItem(`routines_${getUser()}`);
    if (saved) {
      setRoutines(JSON.parse(saved));
    }
  }, []);

  const handleAdd = () => {
    if (routineName.trim() && day) {
      const updated = [
        ...routines,
        { name: routineName, exercises, day: parseInt(day, 10), completed: false }
      ];
      setRoutines(updated);
      setRoutineName('');
      setExercises('');
      setDay('');
      localStorage.setItem(`routines_${getUser()}`, JSON.stringify(updated));
    }
  };

  const toggleCompleted = (index) => {
    const updated = routines.map((rt, i) =>
      i === index ? { ...rt, completed: !rt.completed } : rt
    );
    setRoutines(updated);
    localStorage.setItem(`routines_${getUser()}`, JSON.stringify(updated));
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Agregar Rutina</h2>
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
      <input
        type="number"
        min="1"
        max={TOTAL_DAYS}
        style={inputStyle}
        value={day}
        onChange={(e) => setDay(e.target.value)}
        placeholder="Día del programa"
      />
      <button style={buttonStyle} onClick={handleAdd}>Guardar Rutina</button>
      <h3 style={{ marginTop: '20px' }}>Tus Rutinas</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {routines.map((rt, index) => (
          <li key={index} style={routineStyle}>
            <strong>{rt.name}</strong>
            <p>{rt.exercises}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>Día {rt.day}</span>
              <label>
                <input
                  type="checkbox"
                  checked={rt.completed}
                  onChange={() => toggleCompleted(index)}
                />{' '}
                Completado
              </label>
            </div>
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
