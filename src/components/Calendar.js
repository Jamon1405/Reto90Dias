'use client';
import { useState, useEffect } from 'react';
import { TOTAL_DAYS, START_DATE } from '../constants';
import useCurrentUser from '../hooks/useCurrentUser';

const weekdays = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

const Calendar = () => {
  const user = useCurrentUser();
  const [selectedDay, setSelectedDay] = useState(null);
  const createEmptyDays = () =>
    Array.from({ length: TOTAL_DAYS }, () => ({ completed: false, didRoutine: null, routine: null, weights: {} }));
  const [days, setDays] = useState(createEmptyDays());
  const [savedRoutines, setSavedRoutines] = useState({});
  const [weightInputs, setWeightInputs] = useState({});
  const startDate = new Date(START_DATE);

  useEffect(() => {
    const savedDays = localStorage.getItem(`calendarDays_${user}`);
    setDays(savedDays ? JSON.parse(savedDays) : createEmptyDays());
    const routines = localStorage.getItem(`weeklyRoutines_${user}`);
    setSavedRoutines(routines ? JSON.parse(routines) : {});
  }, [user]);

  useEffect(() => {
    const handler = () => {
      const routines = localStorage.getItem(`weeklyRoutines_${user}`);
      setSavedRoutines(routines ? JSON.parse(routines) : {});
    };
    window.addEventListener('routinesUpdated', handler);
    return () => window.removeEventListener('routinesUpdated', handler);
  }, [user]);

  useEffect(() => {
    localStorage.setItem(`calendarDays_${user}`, JSON.stringify(days));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const handleCompleteDay = (didRoutine) => {
    if (selectedDay !== null) {
      setDays((prev) => {
        const updated = [...prev];
        updated[selectedDay] = {
          ...updated[selectedDay],
          completed: true,
          didRoutine,
          weights: weightInputs,
        };
        return updated;
      });

      if (didRoutine) {
        const routineKey = days[selectedDay].routine || weekdays[new Date(startDate.getTime() + selectedDay * 86400000).getDay()];
        const routine = savedRoutines[routineKey];
        if (routine) {
          const progress = JSON.parse(localStorage.getItem(`exerciseProgress_${user}`) || '{}');
          routine.exercises.forEach((ex) => {
            const entry = { date: new Date(startDate.getTime() + selectedDay * 86400000).toISOString().split('T')[0], weight: parseFloat(weightInputs[ex.name] || ex.weight || 0) };
            if (!progress[ex.name]) progress[ex.name] = [];
            progress[ex.name].push(entry);
            const history = progress[ex.name];
            if (history.length >= 3) {
              const last = history.slice(-3);
              if (last[0].weight === last[1].weight && last[1].weight === last[2].weight) {
                alert(`Considera subir peso en ${ex.name}`);
              }
            }
          });
          localStorage.setItem(`exerciseProgress_${user}`, JSON.stringify(progress));
        }
      }

      if (selectedDay === 29 || selectedDay === 59) {
        alert('¡Recuerda actualizar tu peso y grasa corporal en la sección Peso!');
      }
    }
  };

  const handleResetProgress = () => {
    const reset = createEmptyDays();
    setDays(reset);
    localStorage.removeItem(`calendarDays_${user}`);
    localStorage.removeItem(`weeklyRoutines_${user}`);
    setSavedRoutines({});
    window.dispatchEvent(new Event('routinesUpdated'));
    setSelectedDay(null);
  };

  const renderRoutine = (date) => {
    const dayName = weekdays[date.getDay()];
    const routineKey = days[selectedDay]?.routine || dayName;
    const routine = savedRoutines[routineKey];
    if (!routine) return <p>No hay rutina para este día</p>;
    return (
      <div>
        <h4>{routine.name}</h4>
        {Array.isArray(routine.exercises) ? (
          <ul>
            {routine.exercises.map((ex, idx) => (
              <li key={idx}>
                {ex.name} - {ex.sets}x{ex.reps}
              </li>
            ))}
          </ul>
        ) : (
          <p>{routine.exercises}</p>
        )}
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Calendario de 60 días</h2>
      <div className="calendar-grid">
        {days.map((day, index) => {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + index);
          return (
            <div
              key={index}
              style={dayBoxStyle(day, selectedDay === index)}
              onClick={() => {
                setSelectedDay(index);
                const routineKey = days[index].routine || weekdays[date.getDay()];
                const routine = savedRoutines[routineKey];
                if (routine) {
                  const progress = JSON.parse(localStorage.getItem(`exerciseProgress_${user}`) || '{}');
                  const inputs = {};
                  routine.exercises.forEach((ex) => {
                    const hist = progress[ex.name] || [];
                    inputs[ex.name] = hist.length > 0 ? hist[hist.length - 1].weight : ex.weight || '';
                  });
                  setWeightInputs(inputs);
                }
              }}
            >
              Dia {index + 1}
              <br />
              {date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - {weekdays[date.getDay()]}
            </div>
          );
        })}
      </div>
      {selectedDay !== null && (
        <div style={{ marginTop: '20px' }}>
          {renderRoutine(new Date(startDate.getTime() + selectedDay * 86400000))}

          {!days[selectedDay].routine && Object.keys(savedRoutines).length === 0 && (
            <p>No hay rutinas guardadas. Crea una en la sección Rutinas.</p>
          )}

          {!days[selectedDay].routine && Object.keys(savedRoutines).length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <select
                value=""
                onChange={(e) => {
                  setDays((prev) => {
                    const upd = [...prev];
                    upd[selectedDay].routine = e.target.value;
                    return upd;
                  });
                }}
                style={inputStyle}
              >
                <option value="" disabled>
                  Selecciona rutina
                </option>
                {Object.entries(savedRoutines).map(([key, r]) => (
                  <option key={key} value={key}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!days[selectedDay].completed ? (
            <div>
              {days[selectedDay].routine && (
                <div>
                  {savedRoutines[days[selectedDay].routine]?.exercises.map((ex) => (
                    <div key={ex.name} style={{ marginBottom: '5px' }}>
                      <label>{ex.name}</label>
                      <input
                        type="number"
                        value={weightInputs[ex.name] || ''}
                        onChange={(e) =>
                          setWeightInputs((p) => ({ ...p, [ex.name]: e.target.value }))
                        }
                        style={{ ...inputStyle, width: '80px', marginLeft: '10px' }}
                      />
                    </div>
                  ))}
                </div>
              )}
              <p>¿Completaste la rutina?</p>
              <button style={buttonStyle} onClick={() => handleCompleteDay(true)}>
                Sí
              </button>
              <button
                style={{ ...buttonStyle, backgroundColor: '#e53935' }}
                onClick={() => handleCompleteDay(false)}
              >
                No
              </button>
            </div>
          ) : (
            <p>
              Rutina completada: {days[selectedDay].didRoutine ? 'Sí' : 'No'}
            </p>
          )}
          <button
            style={{ ...buttonStyle, marginTop: '10px', backgroundColor: '#e53935' }}
            onClick={() => {
              setDays((prev) => {
                const upd = [...prev];
                upd[selectedDay].routine = null;
                upd[selectedDay].weights = {};
                return upd;
              });
            }}
          >
            Quitar rutina del día
          </button>
        </div>
      )}
      <button style={{ ...buttonStyle, marginTop: '20px' }} onClick={handleResetProgress}>
        Reiniciar progreso
      </button>
    </div>
  );
};

const containerStyle = {
  padding: '20px',
  backgroundColor: '#ffffff',
  borderRadius: '15px',
  margin: 'auto',
  textAlign: 'center',
  maxWidth: '1000px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
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
  backgroundColor: day.completed
    ? day.didRoutine
      ? '#4caf50'
      : '#e57373'
    : '#f1f1f1',
  boxShadow: selected ? '0px 0px 15px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
});

const buttonStyle = {
  backgroundColor: '#0288d1',
  color: '#fff',
  padding: '12px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  margin: '10px 5px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
};

const inputStyle = {
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #ccc',
  marginBottom: '10px',
};

export default Calendar;
