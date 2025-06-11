'use client';
import { useState, useEffect } from 'react';
import useCurrentUser from '../hooks/useCurrentUser';
import exercisesData from '../data/exercises';

const weekdays = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

const RoutineManager = () => {
  const user = useCurrentUser();
  const [weekday, setWeekday] = useState('lunes');
  const [routineName, setRoutineName] = useState('');
  const muscleGroups = Object.keys(exercisesData);
  const [openGroup, setOpenGroup] = useState(null);
  const [customExercise, setCustomExercise] = useState('');
  const [routineExercises, setRoutineExercises] = useState([]);
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

  const addExercise = (name) => {
    if (name) {
      setRoutineExercises((prev) => [...prev, name]);
    }
  };

  const handleSave = () => {
    if (routineName.trim() && routineExercises.length > 0) {
      const updated = {
        ...routines,
        [weekday]: { name: routineName, exercises: routineExercises },
      };
      setRoutines(updated);
      setRoutineName('');
      setRoutineExercises([]);
      localStorage.setItem(`weeklyRoutines_${user}`, JSON.stringify(updated));
      window.dispatchEvent(new Event('routinesUpdated'));
    }
  };

  const handleDelete = (day) => {
    const updated = { ...routines };
    delete updated[day];
    setRoutines(updated);
    localStorage.setItem(`weeklyRoutines_${user}`, JSON.stringify(updated));
    window.dispatchEvent(new Event('routinesUpdated'));
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
      {muscleGroups.map((group) => (
        <div key={group} style={{ marginBottom: '10px' }}>
          <div
            style={groupHeaderStyle}
            onClick={() => setOpenGroup(openGroup === group ? null : group)}
          >
            {group}
          </div>
          <div
            style={{
              overflow: 'hidden',
              maxHeight: openGroup === group ? '500px' : '0',
              transition: 'max-height 0.3s ease',
            }}
          >
            {exercisesData[group].map((ex) => (
              <button
                key={ex.name}
                type="button"
                style={exerciseButtonStyle}
                onClick={() => addExercise(ex.name)}
              >
                {ex.name}
              </button>
            ))}
          </div>
        </div>
      ))}
      <input
        style={inputStyle}
        value={customExercise}
        onChange={(e) => setCustomExercise(e.target.value)}
        placeholder="Ejercicio personalizado"
      />
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => {
            addExercise(customExercise.trim());
            setCustomExercise('');
          }}
        >
          Añadir Personalizado
        </button>
      </div>
      {routineExercises.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {routineExercises.map((ex, idx) => (
            <li key={idx} style={routineStyle}>
              {ex}
            </li>
          ))}
        </ul>
      )}
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
                <ul style={{ listStyle: 'disc', marginLeft: '20px' }}>
                  {Array.isArray(routines[day].exercises)
                    ? routines[day].exercises.map((ex, i) => (
                        <li key={i}>{ex}</li>
                      ))
                    : <li>{routines[day].exercises}</li>}
                </ul>
                <button
                  type="button"
                  style={{ ...buttonStyle, backgroundColor: '#e53935' }}
                  onClick={() => handleDelete(day)}
                >
                  Eliminar
                </button>
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
  transition: 'background-color 0.3s',
};

const routineStyle = {
  backgroundColor: '#fff',
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '5px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const groupHeaderStyle = {
  backgroundColor: '#0288d1',
  color: '#fff',
  padding: '8px',
  borderRadius: '5px',
  cursor: 'pointer',
  marginBottom: '5px',
  transition: 'background-color 0.3s',
};

const exerciseButtonStyle = {
  backgroundColor: '#0288d1',
  color: '#fff',
  padding: '8px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  display: 'block',
  width: '100%',
  marginBottom: '5px',
  transition: 'background-color 0.3s',
};

export default RoutineManager;
