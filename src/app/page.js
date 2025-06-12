'use client';  // Indica que este componente solo debe ejecutarse en el cliente
import { useState, useEffect } from 'react';
import { TOTAL_DAYS } from '../constants';
import useCurrentUser from '../hooks/useCurrentUser';

// Componente para mostrar el progreso del calendario
const CalendarOverview = () => {
  const [routineDoneDays, setRoutineDoneDays] = useState(0);
  const [routineMissedDays, setRoutineMissedDays] = useState(0);
  const [remainingDays, setRemainingDays] = useState(0);
  const user = useCurrentUser();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDays = localStorage.getItem(`calendarDays_${user}`);
      if (savedDays) {
        const days = JSON.parse(savedDays);
        const done = days.filter((day) => day.didRoutine).length;
        const missed = days.filter((day) => day.completed && !day.didRoutine).length;
        const completed = done + missed;
        setRoutineDoneDays(done);
        setRoutineMissedDays(missed);
        setRemainingDays(TOTAL_DAYS - completed);
      } else {
        setRemainingDays(TOTAL_DAYS);
      }
    }
  }, [user]);

  return (
    <div style={overviewBoxStyle}>
      <h3 style={overviewTitleStyle}>Progreso del Calendario</h3>
      <p>
        <strong style={{ ...indicatorStyle, color: '#30D158' }}>{routineDoneDays}</strong> días con rutina
      </p>
      <p>
        <strong style={{ ...indicatorStyle, color: '#FF453A' }}>{routineMissedDays}</strong> días sin rutina
      </p>
      <p>
        <strong style={{ ...indicatorStyle, color: 'var(--accent-color)' }}>{remainingDays}</strong> días restantes
      </p>
    </div>
  );
};

// Componente para mostrar el progreso de peso
const WeightOverview = () => {
  const [weightDifference, setWeightDifference] = useState(0);
  const [weightGoalDifference, setWeightGoalDifference] = useState(0);
  const weightGoal = 75; // Meta de peso
  const user = useCurrentUser();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEntries = localStorage.getItem(`weightEntries_${user}`);
      if (savedEntries) {
        const weightEntries = JSON.parse(savedEntries);
        const initialWeight = weightEntries.length > 0 ? weightEntries[0].weight : 0;
        const currentWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : 0;
        setWeightDifference((initialWeight - currentWeight).toFixed(1));
        setWeightGoalDifference((currentWeight - weightGoal).toFixed(1)); // Diferencia con la meta
      }
    }
  }, [user]);

  return (
    <div style={overviewBoxStyle}>
      <h3 style={overviewTitleStyle}>Progreso de Peso</h3>
      <p><strong style={{ ...indicatorStyle, color: '#30D158' }}>{weightDifference} kg</strong> bajados</p>
      <p>Faltan <strong style={{ ...indicatorStyle, color: '#FF453A' }}>{weightGoalDifference} kg</strong> para alcanzar tu meta</p>
    </div>
  );
};


// Estilos generales
const overviewBoxStyle = {
  padding: '20px',
  borderRadius: '20px',
  marginBottom: '20px',
  textAlign: 'center',
  backgroundColor: 'var(--background-card)',
  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
};

const overviewTitleStyle = {
  color: '#f5f5f7',
  marginBottom: '15px',
};

const indicatorStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
};

// Página principal con todos los resúmenes
const HomePage = () => {
  const containerStyle = {
    padding: '30px',
    minHeight: '100vh',
    maxWidth: '430px',
    margin: '0 auto',
    textAlign: 'center',
    width: '100%',
  };

  const headerStyle = {
    color: '#f5f5f7',
    marginBottom: '40px',
    fontSize: '32px',
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Resumen General</h1>

      <CalendarOverview />
      <WeightOverview />
    </div>
  );
};

export default HomePage;
