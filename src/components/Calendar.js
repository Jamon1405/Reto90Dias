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

  // Este useEffect carga los datos de localStorage cuando el componente está montado
  useEffect(() => {
    const savedDays = localStorage.getItem('days');
    if (savedDays) {
      setDays(JSON.parse(savedDays));
    }
  }, []);

  // Este useEffect guarda los cambios en days en localStorage cada vez que cambian
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
    } else {
      console.error("No se ha seleccionado un día o grupo muscular válido.");
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

  // Estilos
  const containerStyle = {
    padding: '30px',
    backgroundColor: '#f9f9f9',
    borderRadius: '20px',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
    margin: '30px auto',
    maxWidth: '900px',
    textAlign: 'center',
    fontFamily: "'Poppins', sans-serif",
  };

  const headerStyle = {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '30px',
    color: '#333',
  };

  const dayBoxStyle = (day, selected) => ({
    padding: '20px',
    borderRadius: '10px',
    cursor: 'pointer',
    textAlign: 'center',
    fontSize: '16px',
    transition: '0.3s',
    marginBottom: '10px',
    backgroundColor: day.completed ? '#4caf50' : day.restDay ? '#ffeb3b' : '#e0e0e0',
    transform: selected ? 'scale(1.05)' : 'scale(1)',
    boxShadow: selected ? '0px 0px 15px rgba(0, 0, 0, 0.2)' : 'none',
  });

  const buttonStyle = {
    backgroundColor: '#0288d1',
    color: '#fff',
    padding: '12px 20px',
    fontSize: '18px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '20px',
    marginRight: '10px',
    transition: 'background-color 0.3s ease',
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Calendario de 90 días</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
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
                backgroundColor: '#ffffff',
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
              <ul style={{ listStyleType: 'none', padding: '0' }}>
                {ejerciciosPorGrupo[days[selectedDay].muscleGroup].map((exercise, i) => (
                  <li
                    key={i}
                    style={{
                      backgroundColor: days[selectedDay].exercisesCompleted[i]
                        ? '#4caf50'
                        : '#f0f0f0',
                      padding: '15px',
                      marginBottom: '10px',
                      borderRadius: '8px',
                      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      transition: '0.3s',
                    }}
                    onClick={() => toggleExerciseComplete(i)}
                  >
                    {exercise.name} - {exercise.series} series de {exercise.reps} repeticiones
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            <button
              onClick={handleCompleteDay}
              style={{
                marginRight: '10px',
                padding: '10px',
                backgroundColor: '#0288d1',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Marcar día como completado
            </button>
            <button
              onClick={handleRestDay}
              style={{
                padding: '10px',
                backgroundColor: '#ffeb3b',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Marcar como día de descanso
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleResetProgress}
        style={{ marginTop: '20px', color: 'red', padding: '10px', border: '1px solid red', borderRadius: '5px' }}
      >
        Reiniciar progreso
      </button>
    </div>
  );
};

export default Calendar;
