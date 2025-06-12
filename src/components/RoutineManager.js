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
  const [editingDay, setEditingDay] = useState(null);

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

  const moveExerciseUp = (index) => {
    setRoutineExercises((prev) => {
      if (index === 0) return prev;
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated;
    });
  };

  const moveExerciseDown = (index) => {
    setRoutineExercises((prev) => {
      if (index === prev.length - 1) return prev;
      const updated = [...prev];
      [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
      return updated;
    });
  };

  const removeExercise = (index) => {
    setRoutineExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (routineName.trim() && routineExercises.length > 0) {
      let updated = { ...routines };
      if (editingDay && editingDay !== weekday) {
        delete updated[editingDay];
      }
      updated[weekday] = { name: routineName, exercises: routineExercises };
      setRoutines(updated);
      setRoutineName('');
      setRoutineExercises([]);
      setEditingDay(null);
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

  const handleEdit = (day) => {
    const routine = routines[day];
    if (routine) {
      setWeekday(day);
      setRoutineName(routine.name);
      setRoutineExercises(Array.isArray(routine.exercises) ? [...routine.exercises] : [routine.exercises]);
      setEditingDay(day);
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
        enterKeyHint="next"
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
        enterKeyHint="done"
      />
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <button
          type="button"
          aria-label="Añadir personalizado"
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
            <li key={idx} style={{ ...routineStyle, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ flexGrow: 1 }}>{ex}</span>
              <div style={actionContainerStyle}>
                <button
                  type="button"
                  aria-label="Mover arriba"
                  style={smallButton}
                  onClick={() => moveExerciseUp(idx)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="Mover abajo"
                  style={smallButton}
                  onClick={() => moveExerciseDown(idx)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  aria-label="Eliminar"
                  style={{ ...smallButton, backgroundColor: '#e53935' }}
                  onClick={() => removeExercise(idx)}
                >
                  X
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button style={buttonStyle} aria-label="Guardar rutina" onClick={handleSave}>
        {editingDay ? 'Guardar Cambios' : 'Guardar Rutina'}
      </button>
      {editingDay && (
        <button
          type="button"
          aria-label="Cancelar edición"
          style={{ ...buttonStyle, backgroundColor: '#e53935', marginLeft: '10px' }}
          onClick={() => {
            setEditingDay(null);
            setRoutineName('');
            setRoutineExercises([]);
          }}
        >
          Cancelar
        </button>
      )}
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
                <div style={actionContainerStyle}>
                  <button
                    type="button"
                    aria-label="Eliminar rutina"
                    style={{ ...smallButton, backgroundColor: '#e53935' }}
                    onClick={() => handleDelete(day)}
                  >
                    Eliminar
                  </button>
                  <button
                    type="button"
                    aria-label="Editar rutina"
                    style={smallButton}
                    onClick={() => handleEdit(day)}
                  >
                    Editar
                  </button>
                </div>
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
  maxWidth: '600px',
  margin: 'auto',
  width: '100%',
};

const headerStyle = {
  color: '#bb86fc',
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '6px',
  border: '1px solid #333',
  fontSize: '16px',
  backgroundColor: '#1e1e1e',
  color: '#e0e0e0',
};

const buttonStyle = {
  backgroundColor: '#bb86fc',
  color: '#fff',
  padding: '8px 14px',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
  boxShadow: 'none',
  transition: 'background-color 0.3s',
};

const routineStyle = {
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '5px',
  border: '1px solid #333',
};

const groupHeaderStyle = {
  backgroundColor: '#bb86fc',
  color: '#fff',
  padding: '8px',
  borderRadius: '8px',
  cursor: 'pointer',
  marginBottom: '5px',
  transition: 'background-color 0.3s',
};

const exerciseButtonStyle = {
  backgroundColor: '#bb86fc',
  color: '#fff',
  padding: '8px',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'block',
  width: '100%',
  marginBottom: '5px',
  fontSize: '15px',
  transition: 'background-color 0.3s',
};

const actionContainerStyle = {
  display: 'flex',
  gap: '8px',
  marginLeft: 'auto',
  flexWrap: 'nowrap',
};

const smallButton = {
  backgroundColor: '#bb86fc',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  padding: '6px 10px',
  fontSize: '16px',
  minWidth: '32px',
  width: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: 'none',
};

export default RoutineManager;
