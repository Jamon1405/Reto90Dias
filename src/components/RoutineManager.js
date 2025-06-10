'use client';
import { useState, useEffect } from 'react';

const RoutineManager = () => {
  const [routineName, setRoutineName] = useState('');
  const [exercises, setExercises] = useState('');
  const [routines, setRoutines] = useState([]);

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
    if (routineName.trim()) {
      const updated = [...routines, { name: routineName, exercises }];
      setRoutines(updated);
      setRoutineName('');
      setExercises('');
      localStorage.setItem(`routines_${getUser()}`, JSON.stringify(updated));
    }
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
      <button style={buttonStyle} onClick={handleAdd}>Guardar Rutina</button>
      <h3 style={{ marginTop: '20px' }}>Tus Rutinas</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {routines.map((rt, index) => (
          <li key={index} style={routineStyle}>
            <strong>{rt.name}</strong>
            <p>{rt.exercises}</p>
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
