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
    if (!weight || !height || !age) {
      alert("Por favor, ingresa todos los valores para calcular tu BMR.");
      return;
    }

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

  // Guardar y cargar el progreso en el localStorage
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

  const inputStyle = {
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    border: '1px solid #ddd',
    width: '100%',
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Calculadora de Dieta y Progreso</h2>

      <div>
        <h3>Calculadora de BMR</h3>
        <div>
          <input
            style={inputStyle}
            type="number"
            placeholder="Peso (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <input
            style={inputStyle}
            type="number"
            placeholder="Altura (cm)"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
          <input
            style={inputStyle}
            type="number"
            placeholder="Edad"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
          <select style={inputStyle} value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="male">Hombre</option>
            <option value="female">Mujer</option>
          </select>
          <select style={inputStyle} value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}>
            <option value="1.2">Sedentario</option>
            <option value="1.375">Actividad ligera</option>
            <option value="1.55">Moderado</option>
            <option value="1.725">Activo</option>
            <option value="1.9">Muy activo</option>
          </select>
          <select style={inputStyle} value={deficitOption} onChange={(e) => setDeficitOption(e.target.value)}>
            <option value="mild">Déficit leve (10%)</option>
            <option value="moderate">Déficit moderado (20%)</option>
            <option value="aggressive">Déficit agresivo (30%)</option>
          </select>
          <select style={inputStyle} value={dietType} onChange={(e) => setDietType(e.target.value)}>
            <option value="normal">Dieta normal</option>
            <option value="keto">Dieta cetogénica</option>
            <option value="lowFat">Baja en grasa</option>
          </select>

          <button onClick={calculateBMR} style={inputStyle}>Calcular BMR y Macros</button>
        </div>

        {bmr > 0 && (
          <div>
            <h4>BMR: {bmr} kcal</h4>
            <h4>Calorías diarias: {caloricIntake} kcal</h4>
            <h4>Macronutrientes (gramos por día):</h4>
            <p>Proteínas: {macros.protein}g | Carbohidratos: {macros.carbs}g | Grasas: {macros.fat}g</p>
          </div>
        )}
      </div>

      {/* Aquí empieza el progreso de la dieta */}
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
