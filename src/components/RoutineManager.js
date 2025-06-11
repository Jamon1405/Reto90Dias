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
  const [selectedGroup, setSelectedGroup] = useState(muscleGroups[0]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [customExercise, setCustomExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
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

  const addExercise = () => {
    const name = customExercise.trim() || selectedExercise;
    if (name && sets && reps) {
      setRoutineExercises((prev) => [
        ...prev,
        { group: selectedGroup, name, sets, reps },
      ]);
      setSets('');
      setReps('');
      setCustomExercise('');
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
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <select
          value={selectedGroup}
          onChange={(e) => {
            setSelectedGroup(e.target.value);
            setSelectedExercise('');
            setCustomExercise('');
          }}
          style={inputStyle}
        >
          {muscleGroups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          style={inputStyle}
        >
          <option value="" disabled>
            Selecciona ejercicio
          </option>
          {exercisesData[selectedGroup].map((ex) => (
            <option key={ex.name} value={ex.name}>
              {ex.name}
            </option>
          ))}
        </select>
        <input
          style={inputStyle}
          value={customExercise}
          onChange={(e) => setCustomExercise(e.target.value)}
          placeholder="Ejercicio personalizado"
        />
      </div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          type="number"
          value={sets}
          onChange={(e) => setSets(e.target.value)}
          placeholder="Series"
        />
        <input
          style={{ ...inputStyle, flex: 1 }}
          type="number"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          placeholder="Repeticiones"
        />
        <button type="button" style={buttonStyle} onClick={addExercise}>
          Añadir
        </button>
      </div>
      {routineExercises.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {routineExercises.map((ex, idx) => (
            <li key={idx} style={routineStyle}>
              {ex.name} - {ex.sets}x{ex.reps}
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
                        <li key={i}>
                          {ex.name} - {ex.sets}x{ex.reps}
                        </li>
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
};

const routineStyle = {
  backgroundColor: '#fff',
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '5px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

export default RoutineManager;
