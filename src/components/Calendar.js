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
  const [dayExercises, setDayExercises] = useState([]);
  const [startDate, setStartDate] = useState(new Date(START_DATE));
  const [isEditing, setIsEditing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 480);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    const routineKey = days[selectedDay].routine;
    const routine = savedRoutines[routineKey];

    if (routine) {
      const logs = {};
      const progress = JSON.parse(
        localStorage.getItem(`exerciseProgress_${user}`) || '{}'
      );

      const prevLogs = days[selectedDay].logs || {};

      dayExercises.forEach((ex) => {
        logs[ex] = {
          sets: setInputs[ex] || '',
          reps: repInputs[ex] || '',
          weight: weightInputs[ex] || '',
        };
        const entry = { date, weight: parseFloat(logs[ex].weight || 0) };
        if (!progress[ex]) progress[ex] = [];
        const idx = progress[ex].findIndex((en) => en.date === date);
        if (idx >= 0) {
          progress[ex][idx] = entry;
        } else {
          progress[ex].push(entry);
        }
        const history = progress[ex];
        if (history.length >= 3) {
          const last = history.slice(-3);
          if (last[0].weight === last[1].weight && last[1].weight === last[2].weight) {
            alert(`Considera subir peso en ${ex}`);
          }
        }
      });

      Object.keys(prevLogs).forEach((ex) => {
        if (!dayExercises.includes(ex)) {
          if (progress[ex]) {
            progress[ex] = progress[ex].filter((en) => en.date !== date);
            if (progress[ex].length === 0) delete progress[ex];
          }
        }
      });

      localStorage.setItem(`exerciseProgress_${user}`, JSON.stringify(progress));

      setDays((prev) => {
        const updated = [...prev];
        updated[selectedDay] = {
          ...updated[selectedDay],
          completed: true,
          didRoutine: dayExercises.length > 0,
          routine: routineKey,
          logs,
        };
        return updated;
      });

      if (selectedDay === 29 || selectedDay === 59) {
        alert('¡Recuerda actualizar tu peso y grasa corporal en la sección Peso!');
      }
    }
    setIsEditing(false);
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
    setDayExercises([]);
    setWeightInputs({});
    setSetInputs({});
    setRepInputs({});
    setIsEditing(false);
  };

  const handleRemoveExercise = (ex) => {
    setDayExercises((prev) => prev.filter((e) => e !== ex));
    setWeightInputs((p) => {
      const { [ex]: _, ...rest } = p;
      return rest;
    });
    setSetInputs((p) => {
      const { [ex]: _, ...rest } = p;
      return rest;
    });
    setRepInputs((p) => {
      const { [ex]: _, ...rest } = p;
      return rest;
    });
    setDays((prev) => {
      const updated = [...prev];
      const log = updated[selectedDay]?.logs;
      if (log && log[ex]) {
        const { [ex]: removed, ...rest } = log;
        updated[selectedDay].logs = rest;
      }
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
    setDayExercises([]);
    setWeightInputs({});
    setSetInputs({});
    setRepInputs({});
    setIsEditing(false);
  };

  const renderRoutine = (date) => {
    const routineKey = days[selectedDay]?.routine;
    const routine = routineKey ? savedRoutines[routineKey] : null;
    if (!routine) return <p>No hay rutina para este día</p>;
    const logs = days[selectedDay].logs || {};
    const exercises = days[selectedDay].completed
      ? Object.keys(logs)
      : Array.isArray(routine.exercises)
        ? routine.exercises
        : [];
    return (
      <div>
        <h4>{routine.name}</h4>
        {exercises.length > 0 && (
          <ul>
            {exercises.map((ex, idx) => {
              const log = logs[ex];
              return (
                <li key={idx}>
                  {ex}
                  {log && (
                    <span>
                      {' '}- {log.sets || 0}x{log.reps || 0} @ {log.weight || 0} lb
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
              style={dayBoxStyle(day, selectedDay === index, isMobile)}
              onClick={() => {
                setSelectedDay(index);
                setIsEditing(false);
                const routineKey = days[index].routine;
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
                  const exercisesList =
                    Object.keys(dayLogs).length > 0
                      ? Object.keys(dayLogs)
                      : [...routine.exercises];
                  setDayExercises(exercisesList);
                } else {
                  setDayExercises([]);
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
            overflowY: 'auto',
            maxHeight: '1000px',
            transition: 'max-height 0.3s ease',
          }}
        >
          {!isEditing &&
            renderRoutine(new Date(startDate.getTime() + selectedDay * 86400000))}

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
                  const r = savedRoutines[e.target.value];
                  setDayExercises(r ? [...r.exercises] : []);
                  setWeightInputs({});
                  setSetInputs({});
                  setRepInputs({});
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

          {!days[selectedDay].completed || isEditing ? (
            <div>
              {(() => {
                const routineKey = days[selectedDay].routine;
                const routine = savedRoutines[routineKey];
                const logExercises = Object.keys(days[selectedDay].logs || {});
                const allExercises = routine
                  ? Array.from(new Set([...(routine.exercises || []), ...logExercises]))
                  : logExercises;
                return (
                  <div>
                    {allExercises.map((ex) => {
                      const selected = dayExercises.includes(ex);
                      return (
                        <div key={ex} style={exerciseRowStyle(isMobile, selected)}>
                          <label style={exerciseLabelStyle(isMobile)}>{ex}</label>
                          {selected ? (
                            <>
                              <input
                                type="number"
                                value={setInputs[ex] || ''}
                                onChange={(e) =>
                                  setSetInputs((p) => ({ ...p, [ex]: e.target.value }))
                                }
                                placeholder="Series"
                                aria-label={`Series de ${ex}`}
                                enterKeyHint="next"
                                style={inputSizeStyle(isMobile, '60px')}
                              />
                              <input
                                type="number"
                                value={repInputs[ex] || ''}
                                onChange={(e) =>
                                  setRepInputs((p) => ({ ...p, [ex]: e.target.value }))
                                }
                                placeholder="Reps"
                                aria-label={`Repeticiones de ${ex}`}
                                enterKeyHint="next"
                                style={inputSizeStyle(isMobile, '60px')}
                              />
                              <input
                                type="number"
                                value={weightInputs[ex] || ''}
                                onChange={(e) =>
                                  setWeightInputs((p) => ({ ...p, [ex]: e.target.value }))
                                }
                                placeholder="Lb"
                                aria-label={`Peso de ${ex}`}
                                enterKeyHint="done"
                                style={inputSizeStyle(isMobile, '80px')}
                              />
                              <button
                                type="button"
                                aria-label="Quitar ejercicio"
                                style={removeButton}
                                onClick={() => handleRemoveExercise(ex)}
                              >
                                X
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              aria-label="Agregar ejercicio"
                              style={addButton}
                              onClick={() => setDayExercises((p) => [...p, ex])}
                            >
                              +
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
              <button style={buttonStyle} onClick={handleSaveDay}>
                {days[selectedDay].completed ? 'Guardar cambios' : 'Guardar rutina del día'}
              </button>
              <button
                style={{ ...buttonStyle, backgroundColor: '#e53935' }}
                onClick={handleSkipDay}
              >
                No hice rutina
              </button>
            </div>
          ) : (
            <div>
              <p>
                Rutina completada: {days[selectedDay].didRoutine ? 'Sí' : 'No'}
              </p>
              <button
                type="button"
                aria-label="Editar rutina"
                style={buttonStyle}
                onClick={() => setIsEditing(true)}
              >
                Editar rutina del día
              </button>
            </div>
          )}
          <button
            style={{ ...buttonStyle, marginTop: '10px', backgroundColor: '#e53935' }}
          onClick={() => {
            setDays((prev) => {
              const upd = [...prev];
              upd[selectedDay] = {
                ...upd[selectedDay],
                routine: null,
                logs: {},
                completed: false,
                didRoutine: null,
              };
              return upd;
            });
            setDayExercises([]);
            setWeightInputs({});
            setSetInputs({});
            setRepInputs({});
            setIsEditing(false);
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
  width: '100%',
  maxWidth: '600px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
};

const headerStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '20px',
};

const dayBoxStyle = (day, selected, mobile) => ({
  padding: '10px',
  margin: '5px',
  borderRadius: '8px',
  cursor: 'pointer',
  minHeight: mobile ? '70px' : '60px',
  fontSize: mobile ? '14px' : '16px',
  backgroundColor: day.completed
    ? day.didRoutine
      ? '#4caf50'
      : '#e57373'
    : '#f1f1f1',
  boxShadow: selected ? '0px 0px 15px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
  transition: 'background-color 0.3s, box-shadow 0.3s',
});

const buttonStyle = {
  backgroundColor: '#007bff',
  color: '#fff',
  padding: '10px 16px',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  margin: '10px 5px',
  fontSize: '16px',
  transition: 'background-color 0.2s',
};

const inputStyle = {
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  marginBottom: '10px',
  fontSize: '16px',
};

const exerciseRowStyle = (mobile, selected) => ({
  display: 'flex',
  alignItems: mobile ? 'stretch' : 'center',
  flexDirection: mobile ? 'column' : 'row',
  flexWrap: 'wrap',
  gap: '4px',
  marginBottom: '5px',
  padding: '6px',
  borderRadius: '6px',
  backgroundColor: selected ? '#e3f2fd' : '#f7f7f7',
});

const exerciseLabelStyle = (mobile) => ({
  flex: mobile ? '0 0 100%' : '1',
});

const inputSizeStyle = (mobile, width) => ({
  ...inputStyle,
  width: mobile ? '100%' : width,
});

const removeButton = {
  backgroundColor: 'transparent',
  color: '#e53935',
  border: '1px solid #e53935',
  borderRadius: '50%',
  cursor: 'pointer',
  padding: '4px',
  marginLeft: '5px',
  fontSize: '14px',
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const addButton = {
  ...removeButton,
  color: '#007bff',
  borderColor: '#007bff',
};

export default Calendar;
