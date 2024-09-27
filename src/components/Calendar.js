'use client';
import { useState, useEffect } from 'react';

// Ejercicios con series y repeticiones para cada grupo muscular
const ejerciciosPorGrupo = {
  pecho_triceps: [
    { name: 'Press de banca con barra', series: 4, reps: 10 },
    { name: 'Press inclinado con mancuernas', series: 4, reps: 10 },
    { name: 'Aperturas con mancuernas', series: 4, reps: 12 },
    { name: 'Fondos en paralelas', series: 4, reps: 10 },
    { name: 'Press francés', series: 4, reps: 12 },
    { name: 'Extensiones en polea', series: 4, reps: 12 },
    { name: 'Kickbacks con mancuerna', series: 4, reps: 15 },
    { name: 'Cardio (30 minutos)', series: 1, reps: '30 min' },
  ],
  // Otros grupos musculares omitidos por simplicidad
};

const Calendar = () => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [days, setDays] = useState(() =>
    new Array(90).fill({
      completed: false,
      restDay: false,
      exercisesCompleted: [],
      muscleGroup: '',
    })
  );

  // Cargar datos desde localStorage cuando el componente está montado
  useEffect(() => {
    const savedDays = localStorage.getItem('days');
    if (savedDays) {
      setDays(JSON.parse(savedDays));
    }
  }, []);

  // Guardar cambios en localStorage cuando se actualiza el estado
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('days', JSON.stringify(days));
    }
  }, [days]);

  const handleDayClick = (index) => {
    setSelectedDay(index);
  };

  const handleMuscleGroupChange = (group) => {
    if (selectedDay !== null && group) {
      setDays((prevDays) => {
        const updatedDays = [...prevDays];
        const currentDay = { ...updatedDays[selectedDay] };

        currentDay.muscleGroup = group;
        currentDay.exercisesCompleted = new Array(
          ejerciciosPorGrupo[group].length
        ).fill(false);

        updatedDays[selectedDay] = currentDay;
        return updatedDays;
      });
    }
  };

  const toggleExerciseComplete = (exerciseIndex) => {
    if (selectedDay !== null) {
      setDays((prevDays) => {
        const updatedDays = [...prevDays];
        const currentDay = { ...updatedDays[selectedDay] };
        currentDay.exercisesCompleted = [...currentDay.exercisesCompleted];
        currentDay.exercisesCompleted[exerciseIndex] =
          !currentDay.exercisesCompleted[exerciseIndex];
        updatedDays[selectedDay] = currentDay;
        return updatedDays;
      });
    }
  };

  const handleCompleteDay = () => {
    if (selectedDay !== null) {
      const completedExercises = days[selectedDay].exercisesCompleted.filter(Boolean).length;
      const muscleGroup = days[selectedDay].muscleGroup;
      if (completedExercises === ejerciciosPorGrupo[muscleGroup]?.length) {
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
    const resetDays = new Array(90).fill({
      completed: false,
      restDay: false,
      exercisesCompleted: [],
      muscleGroup: '',
    });
    setDays(resetDays);
    localStorage.removeItem('days');
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
      <h2 style={headerStyle}>Calendario de 90 días</h2>
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
              value={days[selectedDay].muscleGroup}
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
              <option value="pecho_triceps">Pecho y Tríceps</option>
              <option value="espalda_biceps">Espalda y Bíceps</option>
              <option value="piernas">Piernas</option>
              <option value="hombros_trapecios">Hombros y Trapecios</option>
            </select>
          </div>

          {days[selectedDay].muscleGroup && (
            <div>
              <h4 style={{ marginBottom: '10px' }}>Ejercicios:</h4>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {ejerciciosPorGrupo[days[selectedDay].muscleGroup].map((exercise, i) => (
                  <li
                    key={i}
                    style={exerciseStyle(days[selectedDay].exercisesCompleted[i])}
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
