'use client';  // Indica que este componente solo debe ejecutarse en el cliente
import { useState, useEffect } from 'react';

// Componente para mostrar el progreso del calendario
const CalendarOverview = () => {
  const [completedDays, setCompletedDays] = useState(0);
  const [remainingDays, setRemainingDays] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDays = localStorage.getItem('days');
      if (savedDays) {
        const days = JSON.parse(savedDays);
        const completed = days.filter(day => day.completed).length;
        setCompletedDays(completed);
        setRemainingDays(90 - completed);
      }
    }
  }, []);

  return (
    <div style={overviewBoxStyle}>
      <h3 style={overviewTitleStyle}>Progreso del Calendario</h3>
      <p><strong style={{ ...indicatorStyle, color: '#4caf50' }}>{completedDays}</strong> días completados</p>
      <p><strong style={{ ...indicatorStyle, color: '#e53935' }}>{remainingDays}</strong> días restantes</p>
    </div>
  );
};

// Componente para mostrar el progreso de peso
const WeightOverview = () => {
  const [weightDifference, setWeightDifference] = useState(0);
  const [weightGoalDifference, setWeightGoalDifference] = useState(0);
  const weightGoal = 75; // Meta de peso

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEntries = localStorage.getItem('weightEntries');
      if (savedEntries) {
        const weightEntries = JSON.parse(savedEntries);
        const initialWeight = weightEntries.length > 0 ? weightEntries[0].weight : 0;
        const currentWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : 0;
        setWeightDifference((initialWeight - currentWeight).toFixed(1));
        setWeightGoalDifference((currentWeight - weightGoal).toFixed(1)); // Diferencia con la meta
      }
    }
  }, []);

  return (
    <div style={overviewBoxStyle}>
      <h3 style={overviewTitleStyle}>Progreso de Peso</h3>
      <p><strong style={{ ...indicatorStyle, color: '#4caf50' }}>{weightDifference} kg</strong> bajados</p>
      <p>Faltan <strong style={{ ...indicatorStyle, color: '#e53935' }}>{weightGoalDifference} kg</strong> para alcanzar tu meta</p>
    </div>
  );
};

// Componente para mostrar el progreso de la dieta
const DietOverview = () => {
  const [dietDaysCompleted, setDietDaysCompleted] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDays = localStorage.getItem('days');
      if (savedDays) {
        const days = JSON.parse(savedDays);
        const dietDays = days.filter(day => day.dietCompleted).length;
        setDietDaysCompleted(dietDays);
      }
    }
  }, []);

  return (
    <div style={overviewBoxStyle}>
      <h3 style={overviewTitleStyle}>Progreso de la Dieta</h3>
      <p><strong style={{ ...indicatorStyle, color: '#4caf50' }}>{dietDaysCompleted}</strong> días de dieta cumplidos</p>
    </div>
  );
};

// Estilos generales
const overviewBoxStyle = {
  padding: '20px',
  backgroundColor: '#ffffff',
  borderRadius: '10px',
  marginBottom: '20px',
  textAlign: 'center',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  margin: '20px 0',
  '@media (max-width: 480px)': {
    padding: '15px', // Reducimos el padding en móviles
    marginBottom: '15px',
  },
};

const overviewTitleStyle = {
  color: '#0288d1',
  marginBottom: '15px',
  fontSize: '22px',
  '@media (max-width: 480px)': {
    fontSize: '18px', // Ajuste de tamaño en pantallas pequeñas
  },
};

const indicatorStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  '@media (max-width: 480px)': {
    fontSize: '20px', // Ajuste en móviles
  },
};

// Página principal con todos los resúmenes
const HomePage = () => {
  const containerStyle = {
    padding: '40px',
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
    '@media (max-width: 768px)': {
      padding: '20px', // Reducir padding en tablets
    },
    '@media (max-width: 480px)': {
      padding: '10px', // Menos padding en móviles
    },
  };

  const headerStyle = {
    textAlign: 'center',
    color: '#0288d1',
    marginBottom: '40px',
    fontSize: '36px',
    '@media (max-width: 480px)': {
      fontSize: '28px', // Ajuste del título en móviles
      marginBottom: '30px',
    },
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Resumen General</h1>
      
      <CalendarOverview />
      <WeightOverview />
      <DietOverview />
    </div>
  );
};

export default HomePage;
