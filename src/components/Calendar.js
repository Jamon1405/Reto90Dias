'use client';
import { useState, useEffect } from 'react';
import { TOTAL_DAYS } from '../constants';
import { MUSCLE_GROUPS, EXERCISES_BY_GROUP } from '../data/exercises';


const Calendar = () => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [days, setDays] = useState(() =>
    new Array(TOTAL_DAYS).fill({
      completed: false,
      restDay: false,
      muscleGroup: '',
      exercises: [], // { name, series, reps, completed }
    })
  );
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [series, setSeries] = useState('');
  const [reps, setReps] = useState('');

  const getUser = () =>
    (typeof window !== 'undefined' && localStorage.getItem('selectedUser')) ||
    'ximena';

  // Cargar datos desde localStorage cuando el componente está montado
  useEffect(() => {
    const savedDays = localStorage.getItem(`calendarDays_${getUser()}`);
    if (savedDays) {
      setDays(JSON.parse(savedDays));
    }
  }, []);

  // Guardar cambios en localStorage cuando se actualiza el estado
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`calendarDays_${getUser()}`, JSON.stringify(days));
    }
  }, [days]);

  const handleDayClick = (index) => {
    setSelectedDay(index);
    const day = days[index];
    setSelectedGroup(day.muscleGroup || '');
    setSelectedExercise('');
    setSeries('');
    setReps('');
  };

  const handleMuscleGroupChange = (group) => {
    setSelectedGroup(group);
    if (selectedDay !== null) {
      setDays((prevDays) => {
        const updatedDays = [...prevDays];
        updatedDays[selectedDay] = {
          ...updatedDays[selectedDay],
          muscleGroup: group,
          exercises: [],
        };
        return updatedDays;
      });
    }
  };

  const handleAddExercise = () => {
    if (selectedDay !== null && selectedExercise && series && reps) {
      setDays((prevDays) => {
        const updatedDays = [...prevDays];
        const currentDay = { ...updatedDays[selectedDay] };
        currentDay.exercises = [
          ...currentDay.exercises,
          { name: selectedExercise, series, reps, completed: false },
        ];
        updatedDays[selectedDay] = currentDay;
        return updatedDays;
      });
      setSelectedExercise('');
      setSeries('');
      setReps('');
    }
  };

  const toggleExerciseComplete = (exerciseIndex) => {
    if (selectedDay !== null) {
      setDays((prevDays) => {
        const updatedDays = [...prevDays];
        const currentDay = { ...updatedDays[selectedDay] };
        currentDay.exercises = currentDay.exercises.map((ex, idx) =>
          idx === exerciseIndex ? { ...ex, completed: !ex.completed } : ex
        );
        updatedDays[selectedDay] = currentDay;
        return updatedDays;
      });
    }
  };

  const handleCompleteDay = () => {
    if (selectedDay !== null) {
      const exercises = days[selectedDay].exercises;
      const allDone = exercises.length > 0 && exercises.every((ex) => ex.completed);
      if (allDone) {
        setDays((prevDays) => {
          const updatedDays = [...prevDays];
          updatedDays[selectedDay].completed = true;
          return updatedDays;
        });
      } else {
        alert('Completa todos los ejercicios antes de marcar el día como completado.');
      }
    }
  };

  const handleRestDay = () => {
    if (selectedDay !== null) {
      setDays((prevDays) => {
        const updatedDays = [...prevDays];
        updatedDays[selectedDay].restDay = true;
        return updatedDays;
      });
    }
  };

  const handleResetProgress = () => {
    const resetDays = new Array(TOTAL_DAYS).fill({
      completed: false,
      restDay: false,
      muscleGroup: '',
      exercises: [],
    });
    setDays(resetDays);
    localStorage.removeItem(`calendarDays_${getUser()}`);
    setSelectedDay(null);
  };

  // Estilos en línea para diseño moderno y adaptado a móviles
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
    backgroundColor: day.completed ? '#4caf50' : day.restDay ? '#ffeb3b' : '#e0e0e0',
    boxShadow: selected ? '0px 0px 15px rgba(0, 0, 0, 0.2)' : 'none',
    transform: selected ? 'scale(1.05)' : 'scale(1)',
    transition: 'transform 0.2s',
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
    gridTemplateColumns: 'repeat(4, 1fr)', // Ajustado para móviles
    gap: '10px',
    '@media (max-width: 600px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  };

  const exerciseStyle = (completed) => ({
    padding: '10px',
    backgroundColor: completed ? '#4caf50' : '#f0f0f0',
    borderRadius: '8px',
    marginBottom: '10px',
    cursor: 'pointer',
  });

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Calendario de 60 días</h2>
      <div style={gridStyle}>
        {days.map((day, index) => (
          <div
            key={index}
            style={dayBoxStyle(day, selectedDay === index)}
            onClick={() => handleDayClick(index)}
          >
            Día {index + 1}
          </div>
        ))}
      </div>

      {selectedDay !== null && (
        <div style={{ marginTop: '20px' }}>
          <h3>
            Día {selectedDay + 1} -{' '}
            {days[selectedDay].muscleGroup
              ? 'Grupo muscular: ' + days[selectedDay].muscleGroup
              : 'Elige tu grupo muscular'}
          </h3>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ marginRight: '10px' }}>Selecciona un grupo muscular:</label>
            <select
              value={selectedGroup}
              onChange={(e) => handleMuscleGroupChange(e.target.value)}
              style={{
                padding: '10px',
                fontSize: '14px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
              }}
            >
              <option value="">Selecciona</option>
              {MUSCLE_GROUPS.map((grp) => (
                <option key={grp.key} value={grp.key}>
                  {grp.label}
                </option>
              ))}
            </select>
          </div>

          {selectedGroup && (
            <div style={{ marginBottom: '15px' }}>
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                style={{ padding: '10px', marginRight: '10px', borderRadius: '5px' }}
              >
                <option value="">Ejercicio</option>
                {EXERCISES_BY_GROUP[selectedGroup].map((ex) => (
                  <option key={ex.name} value={ex.name}>
                    {ex.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Series"
                value={series}
                onChange={(e) => setSeries(e.target.value)}
                style={{ width: '80px', marginRight: '10px', padding: '10px', borderRadius: '5px' }}
              />
              <input
                type="number"
                placeholder="Reps"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                style={{ width: '80px', marginRight: '10px', padding: '10px', borderRadius: '5px' }}
              />
              <button style={buttonStyle} onClick={handleAddExercise}>
                Añadir ejercicio
              </button>
            </div>
          )}

          {days[selectedDay].exercises.length > 0 && (
            <div>
              <h4 style={{ marginBottom: '10px' }}>Ejercicios:</h4>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {days[selectedDay].exercises.map((exercise, i) => (
                  <li
                    key={i}
                    style={exerciseStyle(exercise.completed)}
                    onClick={() => toggleExerciseComplete(i)}
                  >
                    {exercise.name} - {exercise.series} series de {exercise.reps} repeticiones
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            <button style={buttonStyle} onClick={handleCompleteDay}>
              Marcar día como completado
            </button>
            <button style={{ ...buttonStyle, backgroundColor: '#ffeb3b', color: '#000' }} onClick={handleRestDay}>
              Marcar como día de descanso
            </button>
          </div>
        </div>
      )}

      <button style={{ ...buttonStyle, color: 'red', borderColor: 'red' }} onClick={handleResetProgress}>
        Reiniciar progreso
      </button>
    </div>
  );
};

export default Calendar;
