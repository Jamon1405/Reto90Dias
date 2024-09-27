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
  espalda_biceps: [
    { name: 'Dominadas', series: 4, reps: 10 },
    { name: 'Remo con barra', series: 4, reps: 12 },
    { name: 'Peso muerto', series: 4, reps: 10 },
    { name: 'Curl con barra', series: 4, reps: 12 },
    { name: 'Curl alternado con mancuernas', series: 4, reps: 12 },
    { name: 'Curl en predicador', series: 4, reps: 10 },
    { name: 'Remo en máquina', series: 4, reps: 12 },
    { name: 'Cardio (30 minutos)', series: 1, reps: '30 min' },
  ],
  piernas: [
    { name: 'Sentadilla', series: 4, reps: 12 },
    { name: 'Prensa de pierna', series: 4, reps: 12 },
    { name: 'Peso muerto rumano', series: 4, reps: 10 },
    { name: 'Extensión de cuádriceps', series: 4, reps: 12 },
    { name: 'Curl femoral', series: 4, reps: 12 },
    { name: 'Elevación de talones', series: 4, reps: 15 },
    { name: 'Cardio (30 minutos)', series: 1, reps: '30 min' },
  ],
  hombros_trapecios: [
    { name: 'Press militar con barra', series: 4, reps: 10 },
    { name: 'Elevaciones laterales', series: 4, reps: 12 },
    { name: 'Elevaciones frontales', series: 4, reps: 12 },
    { name: 'Encogimientos con mancuernas', series: 4, reps: 15 },
    { name: 'Remo al mentón', series: 4, reps: 12 },
    { name: 'Cardio (30 minutos)', series: 1, reps: '30 min' },
  ],
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

  return (
    <div className="calendar-container">
      <h2 className="calendar-header">Calendario de 90 días</h2>

      <div className="calendar-grid">
        {days.map((day, index) => (
          <div
            key={index}
            className={`calendar-day-box ${selectedDay === index ? 'selected' : ''}`}
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
              className="calendar-select"
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
              <ul style={{ listStyleType: 'none', padding: '0' }}>
                {ejerciciosPorGrupo[days[selectedDay].muscleGroup].map((exercise, i) => (
                  <li
                    key={i}
                    className={`calendar-exercise ${days[selectedDay].exercisesCompleted[i] ? 'completed' : ''}`}
                    onClick={() => toggleExerciseComplete(i)}
                  >
                    {exercise.name} - {exercise.series} series de {exercise.reps} repeticiones
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            <button className="calendar-button" onClick={handleCompleteDay}>
              Marcar día como completado
            </button>
            <button className="calendar-button rest" onClick={handleRestDay}>
              Marcar como día de descanso
            </button>
          </div>
        </div>
      )}

      <button className="calendar-reset-button" onClick={handleResetProgress}>
        Reiniciar progreso
      </button>
    </div>
  );
};

export default Calendar;
