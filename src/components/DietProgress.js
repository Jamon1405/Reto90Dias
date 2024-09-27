'use client';  // Componente para ejecutarse en el cliente
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
  const [activityLevel, setActivityLevel] = useState('1.2'); // Actividad sedentaria por defecto
  const [deficitOption, setDeficitOption] = useState('moderate'); // Déficit moderado por defecto
  const [dietType, setDietType] = useState('normal'); // Tipo de dieta por defecto
  const [bmr, setBmr] = useState(0);
  const [caloricIntake, setCaloricIntake] = useState(0);
  const [macros, setMacros] = useState({ protein: 0, carbs: 0, fat: 0 });

  // Opciones de déficit calórico (basado en porcentaje)
  const deficitOptions = {
    mild: 0.1, // 10%
    moderate: 0.2, // 20%
    aggressive: 0.3, // 30%
  };

  // Distribución de macros según el tipo de dieta
  const dietMacros = {
    normal: { protein: 0.30, carbs: 0.40, fat: 0.30 },
    keto: { protein: 0.25, carbs: 0.05, fat: 0.70 },
    lowFat: { protein: 0.35, carbs: 0.50, fat: 0.15 },
  };

  // Función para calcular el BMR y las calorías diarias
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

  // Función para calcular la distribución de macros según el tipo de dieta
  const calculateMacros = (totalCalories) => {
    const macroSplit = dietMacros[dietType];
    const protein = (totalCalories * macroSplit.protein) / 4; // Proteínas (cal/4)
    const carbs = (totalCalories * macroSplit.carbs) / 4; // Carbohidratos (cal/4)
    const fat = (totalCalories * macroSplit.fat) / 9; // Grasas (cal/9)

    setMacros({
      protein: protein.toFixed(1),
      carbs: carbs.toFixed(1),
      fat: fat.toFixed(1),
    });
  };

  // Este useEffect carga los datos de localStorage cuando el componente está montado
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDays = localStorage.getItem('days');
      if (savedDays) {
        setDays(JSON.parse(savedDays));
      }
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
    setFastingHours(days[index].fastingHours); // Mostrar las horas de ayuno si ya existen
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

  // Calcular el porcentaje de avance de la dieta
  const completedDays = days.filter((day) => day.dietCompleted).length;
  const dietProgressPercentage = ((completedDays / days.length) * 100).toFixed(1);

  // Calcular el tiempo promedio de ayuno solo de los días completados
  const fastingDays = days.filter((day) => day.dietCompleted && parseFloat(day.fastingHours) > 0);
  const totalFastingHours = fastingDays.reduce((acc, day) => acc + (parseFloat(day.fastingHours) || 0), 0);
  const averageFastingHours = fastingDays.length > 0 ? (totalFastingHours / fastingDays.length).toFixed(1) : '0';

  // Datos para la gráfica de pie
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

  // Ajustes para que el grid se vea bien en pantallas pequeñas
  const dayGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)', // 7 columnas para vista en desktop
    gap: '10px',
    '@media (max-width: 768px)': { // Cambios para dispositivos móviles
      gridTemplateColumns: 'repeat(3, 1fr)', // 3 columnas para pantallas medianas
    },
    '@media (max-width: 480px)': {
      gridTemplateColumns: 'repeat(2, 1fr)', // 2 columnas para pantallas pequeñas
    },
  };

  const dayBoxStyle = (day, selected) => ({
    padding: '20px',
    borderRadius: '10px',
    cursor: 'pointer',
    textAlign: 'center',
    fontSize: '16px',
    transition: '0.3s',
    marginBottom: '10px',
    backgroundColor: day.dietCompleted ? '#4caf50' : '#e0e0e0',
    transform: selected ? 'scale(1.05)' : 'scale(1)',
    boxShadow: selected ? '0px 0px 15px rgba(0, 0, 0, 0.2)' : 'none',
  });

  const inputStyle = {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    marginBottom: '15px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  };

  const selectStyle = {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    marginBottom: '20px',
    width: '100%',
  };

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
      <h2 style={headerStyle}>Calculadora de Dieta y Progreso</h2>

      <div style={dayGridStyle}>
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
          <h3>Día {selectedDay + 1} - {days[selectedDay].dietCompleted ? 'Dieta cumplida' : 'Dieta no cumplida'}</h3>

          <div style={{ marginTop: '20px' }}>
            <label htmlFor="fasting">Introduce tus horas de ayuno:</label>
            <input
              type="number"
              id="fasting"
              value={fastingHours}
              onChange={handleFastingHoursChange}
              style={inputStyle}
            />
            <button onClick={handleSaveFastingHours} style={buttonStyle}>
              Guardar Ayuno y Completar Día
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '40px' }}>
        <h3>Calculadora de Metabolismo Basal (BMR)</h3>
        <div>
          <label>Peso (kg):</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label>Altura (cm):</label>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label>Edad:</label>
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label>Género:</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} style={selectStyle}>
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
          </select>
        </div>
        <div>
          <label>Nivel de Actividad:</label>
          <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} style={selectStyle}>
            <option value="1.2">Sedentario</option>
            <option value="1.375">Ligero</option>
            <option value="1.55">Moderado</option>
            <option value="1.725">Activo</option>
            <option value="1.9">Muy activo</option>
          </select>
        </div>
        <div>
          <label>Déficit Calórico:</label>
          <select value={deficitOption} onChange={(e) => setDeficitOption(e.target.value)} style={selectStyle}>
            <option value="mild">Leve (10%)</option>
            <option value="moderate">Moderado (20%)</option>
            <option value="aggressive">Agresivo (30%)</option>
          </select>
        </div>
        <div>
          <label>Tipo de Dieta:</label>
          <select value={dietType} onChange={(e) => setDietType(e.target.value)} style={selectStyle}>
            <option value="normal">Normal</option>
            <option value="keto">Keto (Cetogénica)</option>
            <option value="lowFat">Baja en Grasas</option>
          </select>
        </div>

        <button onClick={calculateBMR} style={buttonStyle}>
          Calcular BMR y Calorías
        </button>

        {caloricIntake > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4>Resultados</h4>
            <p>BMR: {bmr} cal</p>
            <p>Calorías Diarias: {caloricIntake} cal</p>
            <p>Macros: Proteínas: {macros.protein}g, Carbohidratos: {macros.carbs}g, Grasas: {macros.fat}g</p>
          </div>
        )}
      </div>

      <h3 style={{ marginTop: '40px' }}>Indicadores de Progreso</h3>
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

      <button onClick={handleResetProgress} style={{ ...buttonStyle, backgroundColor: '#e53935' }}>
        Reiniciar progreso
      </button>
    </div>
  );
};

export default DietProgress;
