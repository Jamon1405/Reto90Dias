'use client';  // Esto indica que este componente solo debe renderizarse en el cliente

import { useState, useEffect } from 'react';

// Ejercicios con series y repeticiones para cada grupo muscular
const ejerciciosPorGrupo = {
  // (aquí va el mismo objeto ejerciciosPorGrupo)
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

  // Este useEffect se asegura de que el acceso a localStorage ocurra solo en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDays = localStorage.getItem('days');
      if (savedDays) {
        setDays(JSON.parse(savedDays));
      }
    }
  }, []); // Solo se ejecuta una vez al montar el componente

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('days', JSON.stringify(days));
    }
  }, [days]); // Actualiza localStorage cada vez que cambien los días

  const handleDayClick = (index) => {
    setSelectedDay(index);
  };

  const handleMuscleGroupChange = (group) => {
    setDays((prevDays) => {
      const updatedDays = [...prevDays];
      updatedDays[selectedDay].muscleGroup = group;
      updatedDays[selectedDay].exercisesCompleted = new Array(
        ejerciciosPorGrupo[group].length
      ).fill(false);
      return updatedDays;
    });
  };

  const toggleExerciseComplete = (exerciseIndex) => {
    setDays((prevDays) => {
      const updatedDays = [...prevDays];
      const currentDay = { ...updatedDays[selectedDay] };
      currentDay.exercisesCompleted = [...currentDay.exercisesCompleted];
      currentDay.exercisesCompleted[exerciseIndex] =
        !currentDay.exercisesCompleted[exerciseIndex];
      updatedDays[selectedDay] = currentDay;
      return updatedDays;
    });
  };

  const handleCompleteDay = () => {
    const completedExercises = days[selectedDay].exercisesCompleted.filter(Boolean)
      .length;
    const muscleGroup = days[selectedDay].muscleGroup;
    if (completedExercises === ejerciciosPorGrupo[muscleGroup].length) {
      setDays((prevDays) => {
        const updatedDays = [...prevDays];
        updatedDays[selectedDay].completed = true;
        return updatedDays;
      });
    } else {
      alert('Completa todos los ejercicios antes de marcar el día como completado.');
    }
  };

  const handleRestDay = () => {
    setDays((prevDays) => {
      const updatedDays = [...prevDays];
      updatedDays[selectedDay].restDay = true;
      return updatedDays;
    });
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

  // El código de tus estilos y el JSX permanecen igual
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
