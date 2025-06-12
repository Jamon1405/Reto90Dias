'use client';
import { useState, useEffect } from 'react';
import { TOTAL_DAYS, START_DATE } from '../constants';
import useCurrentUser from '../hooks/useCurrentUser';

const weekdays = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

const Calendar = () => {
  const user = useCurrentUser();
  const [selectedDay, setSelectedDay] = useState(null);
  const createEmptyDays = () =>
    Array.from({
      length: TOTAL_DAYS,
    }, () => ({ completed: false, didRoutine: null, routine: null, logs: {} }));
  const [days, setDays] = useState(createEmptyDays());
  const [savedRoutines, setSavedRoutines] = useState({});
  const [weightInputs, setWeightInputs] = useState({});
  const [setInputs, setSetInputs] = useState({});
  const [repInputs, setRepInputs] = useState({});
  const [startDate, setStartDate] = useState(new Date(START_DATE));

  useEffect(() => {
    const savedDays = localStorage.getItem(`calendarDays_${user}`);
    setDays(savedDays ? JSON.parse(savedDays) : createEmptyDays());
    const routines = localStorage.getItem(`weeklyRoutines_${user}`);
    setSavedRoutines(routines ? JSON.parse(routines) : {});
    const sd = localStorage.getItem(`startDate_${user}`);
    if (sd) setStartDate(new Date(sd));
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
    localStorage.setItem(`startDate_${user}`, startDate.toISOString());
  }, [startDate, user]);

  useEffect(() => {
    localStorage.setItem(`calendarDays_${user}`, JSON.stringify(days));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const handleSaveDay = () => {
    if (selectedDay === null) return;

    const date = new Date(startDate.getTime() + selectedDay * 86400000)
      .toISOString()
      .split('T')[0];
    const routineKey =
      days[selectedDay].routine || weekdays[new Date(startDate.getTime() + selectedDay * 86400000).getDay()];
    const routine = savedRoutines[routineKey];

    if (routine) {
      const logs = {};
      const progress = JSON.parse(
        localStorage.getItem(`exerciseProgress_${user}`) || '{}'
      );
      routine.exercises.forEach((ex) => {
        logs[ex] = {
          sets: setInputs[ex] || '',
          reps: repInputs[ex] || '',
          weight: weightInputs[ex] || '',
        };
        const entry = { date, weight: parseFloat(logs[ex].weight || 0) };
        if (!progress[ex]) progress[ex] = [];
        progress[ex].push(entry);
        const history = progress[ex];
        if (history.length >= 3) {
          const last = history.slice(-3);
          if (last[0].weight === last[1].weight && last[1].weight === last[2].weight) {
            alert(`Considera subir peso en ${ex}`);
          }
        }
      });
      localStorage.setItem(`exerciseProgress_${user}`, JSON.stringify(progress));

      setDays((prev) => {
        const updated = [...prev];
        updated[selectedDay] = {
          ...updated[selectedDay],
          completed: true,
          didRoutine: true,
          routine: routineKey,
          logs,
        };
        return updated;
      });

      if (selectedDay === 29 || selectedDay === 59) {
        alert('¡Recuerda actualizar tu peso y grasa corporal en la sección Peso!');
      }
    }
  };

  const handleSkipDay = () => {
    if (selectedDay === null) return;
    setDays((prev) => {
      const updated = [...prev];
      updated[selectedDay] = {
        ...updated[selectedDay],
        completed: true,
        didRoutine: false,
        logs: {},
      };
      return updated;
    });
  };

  const handleResetProgress = () => {
    const reset = createEmptyDays();
    setDays(reset);
    localStorage.removeItem(`calendarDays_${user}`);
    localStorage.removeItem(`weeklyRoutines_${user}`);
    localStorage.removeItem(`exerciseProgress_${user}`);
    localStorage.removeItem(`startDate_${user}`);
    setSavedRoutines({});
    window.dispatchEvent(new Event('routinesUpdated'));
    setSelectedDay(null);
    setStartDate(new Date(START_DATE));
  };

  const renderRoutine = (date) => {
    const dayName = weekdays[date.getDay()];
    const routineKey = days[selectedDay]?.routine || dayName;
    const routine = savedRoutines[routineKey];
    if (!routine) return <p>No hay rutina para este día</p>;
    return (
      <div>
        <h4>{routine.name}</h4>
        {days[selectedDay].completed && Array.isArray(routine.exercises) && (
          <ul>
            {routine.exercises.map((ex, idx) => {
              const log = days[selectedDay].logs?.[ex];
              return (
                <li key={idx}>
                  {ex}
                  {log && (
                    <span>
                      {' '}- {log.sets || 0}x{log.reps || 0} @ {log.weight || 0}{' '}
                      lb
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Calendario de 60 días</h2>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ marginRight: '10px' }}>Inicio del reto:</label>
        <input
          type="date"
          value={startDate.toISOString().split('T')[0]}
          onChange={(e) => {
            const [y, m, d] = e.target.value.split('-');
            setStartDate(new Date(y, m - 1, d));
          }}
          style={inputStyle}
        />
      </div>
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
                  const progress = JSON.parse(
                    localStorage.getItem(`exerciseProgress_${user}`) || '{}'
                  );
                  const weightMap = {};
                  const setMap = {};
                  const repMap = {};
                  routine.exercises.forEach((ex) => {
                    const hist = progress[ex] || [];
                    weightMap[ex] = hist.length > 0 ? hist[hist.length - 1].weight : '';
                    setMap[ex] = '';
                    repMap[ex] = '';
                  });
                  const dayLogs = days[index].logs || {};
                  Object.entries(dayLogs).forEach(([name, log]) => {
                    if (log.weight) weightMap[name] = log.weight;
                    if (log.sets) setMap[name] = log.sets;
                    if (log.reps) repMap[name] = log.reps;
                  });
                  setWeightInputs(weightMap);
                  setSetInputs(setMap);
                  setRepInputs(repMap);
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
        <div
          style={{
            marginTop: '20px',
            overflow: 'hidden',
            maxHeight: '1000px',
            transition: 'max-height 0.3s ease',
          }}
        >
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
                    <div key={ex} style={{ marginBottom: '5px' }}>
                      <label>{ex}</label>
                      <input
                        type="number"
                        value={setInputs[ex] || ''}
                        onChange={(e) =>
                          setSetInputs((p) => ({ ...p, [ex]: e.target.value }))
                        }
                        placeholder="Series"
                        style={{ ...inputStyle, width: '60px', marginLeft: '10px' }}
                      />
                      <input
                        type="number"
                        value={repInputs[ex] || ''}
                        onChange={(e) =>
                          setRepInputs((p) => ({ ...p, [ex]: e.target.value }))
                        }
                        placeholder="Reps"
                        style={{ ...inputStyle, width: '60px', marginLeft: '10px' }}
                      />
                      <input
                        type="number"
                        value={weightInputs[ex] || ''}
                        onChange={(e) =>
                          setWeightInputs((p) => ({ ...p, [ex]: e.target.value }))
                        }
                        placeholder="Lb"
                        style={{ ...inputStyle, width: '80px', marginLeft: '10px' }}
                      />
                    </div>
                  ))}
                </div>
              )}
              <button style={buttonStyle} onClick={handleSaveDay}>
                Guardar rutina del día
              </button>
              <button
                style={{ ...buttonStyle, backgroundColor: '#e53935' }}
                onClick={handleSkipDay}
              >
                No hice rutina
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
                upd[selectedDay].logs = {};
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
  transition: 'background-color 0.3s, box-shadow 0.3s',
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
