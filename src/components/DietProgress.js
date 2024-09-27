'use client';
import { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DietProgress = () => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [fastingHours, setFastingHours] = useState('');
  const [days, setDays] = useState(() =>
    new Array(90).fill({
      dietCompleted: false,
      fastingHours: '',
    })
  );

  // Variables para calculadora BMR y macros
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('1.2');
  const [deficitOption, setDeficitOption] = useState('moderate');
  const [dietType, setDietType] = useState('normal');
  const [bmr, setBmr] = useState(0);
  const [caloricIntake, setCaloricIntake] = useState(0);
  const [macros, setMacros] = useState({ protein: 0, carbs: 0, fat: 0 });

  const deficitOptions = {
    mild: 0.1,
    moderate: 0.2,
    aggressive: 0.3,
  };

  const dietMacros = {
    normal: { protein: 0.30, carbs: 0.40, fat: 0.30 },
    keto: { protein: 0.25, carbs: 0.05, fat: 0.70 },
    lowFat: { protein: 0.35, carbs: 0.50, fat: 0.15 },
  };

  // Cálculo del BMR y la ingesta diaria de calorías
  const calculateBMR = () => {
    let calculatedBMR;
    if (gender === 'male') {
      calculatedBMR = 88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age);
    } else {
      calculatedBMR = 447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * age);
    }
    const dailyCalories = calculatedBMR * parseFloat(activityLevel);
    const totalCalories = dailyCalories * (1 - deficitOptions[deficitOption]);

    setBmr(calculatedBMR.toFixed(0));
    setCaloricIntake(totalCalories.toFixed(0));
    calculateMacros(totalCalories);
  };

  const calculateMacros = (totalCalories) => {
    const macroSplit = dietMacros[dietType];
    const protein = (totalCalories * macroSplit.protein) / 4;
    const carbs = (totalCalories * macroSplit.carbs) / 4;
    const fat = (totalCalories * macroSplit.fat) / 9;

    setMacros({
      protein: protein.toFixed(1),
      carbs: carbs.toFixed(1),
      fat: fat.toFixed(1),
    });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDays = localStorage.getItem('days');
      if (savedDays) {
        setDays(JSON.parse(savedDays));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('days', JSON.stringify(days));
    }
  }, [days]);

  const handleDayClick = (index) => {
    setSelectedDay(index);
    setFastingHours(days[index].fastingHours);
  };

  const handleFastingHoursChange = (e) => {
    setFastingHours(e.target.value);
  };

  const handleSaveFastingHours = () => {
    if (fastingHours > 0) {
      setDays((prevDays) => {
        const updatedDays = [...prevDays];
        updatedDays[selectedDay] = {
          ...updatedDays[selectedDay],
          fastingHours,
          dietCompleted: true,
        };
        return updatedDays;
      });
      setFastingHours('');
    } else {
      alert('Por favor, introduce horas de ayuno para marcar el día como cumplido.');
    }
  };

  const handleResetProgress = () => {
    const resetDays = new Array(90).fill({
      dietCompleted: false,
      fastingHours: '',
    });
    setDays(resetDays);
    localStorage.removeItem('days');
    setSelectedDay(null);
  };

  const completedDays = days.filter((day) => day.dietCompleted).length;
  const dietProgressPercentage = ((completedDays / days.length) * 100).toFixed(1);

  const fastingDays = days.filter((day) => day.dietCompleted && parseFloat(day.fastingHours) > 0);
  const totalFastingHours = fastingDays.reduce((acc, day) => acc + (parseFloat(day.fastingHours) || 0), 0);
  const averageFastingHours = fastingDays.length > 0 ? (totalFastingHours / fastingDays.length).toFixed(1) : '0';

  const pieData = {
    labels: ['Días cumplidos', 'Días restantes'],
    datasets: [
      {
        data: [completedDays, 90 - completedDays],
        backgroundColor: ['#4caf50', '#e0e0e0'],
        hoverBackgroundColor: ['#66bb6a', '#bdbdbd'],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw}`,
        },
      },
    },
  };

  // Definimos infoContainerStyle aquí
  const infoContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '20px',
  };

  const infoBoxStyle = {
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px',
  };

  const infoHeaderStyle = {
    fontSize: '18px',
    color: '#666',
    marginBottom: '10px',
  };

  const infoValueStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Calculadora de Dieta y Progreso</h2>

      <div>
        <h3>Datos para calcular BMR y macros</h3>
        <input
          type="number"
          placeholder="Peso (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          style={{ padding: '10px', margin: '10px 0', borderRadius: '5px' }}
        />
        <input
          type="number"
          placeholder="Altura (cm)"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          style={{ padding: '10px', margin: '10px 0', borderRadius: '5px' }}
        />
        <input
          type="number"
          placeholder="Edad"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          style={{ padding: '10px', margin: '10px 0', borderRadius: '5px' }}
        />
        <button onClick={calculateBMR} style={{ padding: '10px 20px', backgroundColor: '#0288d1', color: '#fff' }}>
          Calcular BMR y Macros
        </button>

        {caloricIntake > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4>Ingesta calórica diaria: {caloricIntake} kcal</h4>
            <p>Proteínas: {macros.protein}g</p>
            <p>Carbohidratos: {macros.carbs}g</p>
            <p>Grasas: {macros.fat}g</p>
          </div>
        )}
      </div>

      <h3>Progreso del calendario de dieta</h3>
      <div style={infoContainerStyle}>
        <div style={infoBoxStyle}>
          <p style={infoHeaderStyle}>Días cumplidos</p>
          <p style={infoValueStyle}>{completedDays} / 90</p>
        </div>
        <div style={infoBoxStyle}>
          <p style={infoHeaderStyle}>Porcentaje de avance</p>
          <p style={infoValueStyle}>{dietProgressPercentage}%</p>
        </div>
        <div style={infoBoxStyle}>
          <p style={infoHeaderStyle}>Horas de ayuno promedio</p>
          <p style={infoValueStyle}>{averageFastingHours} hrs</p>
        </div>
      </div>

      <h3>Gráfico de Progreso</h3>
      <Pie data={pieData} options={pieOptions} />

      <button
        onClick={handleResetProgress}
        style={{
          backgroundColor: '#e53935',
          color: '#fff',
          padding: '12px 20px',
          fontSize: '18px',
          borderRadius: '10px',
          border: 'none',
          cursor: 'pointer',
          marginTop: '20px',
        }}
      >
        Reiniciar progreso
      </button>
    </div>
  );
};

export default DietProgress;
