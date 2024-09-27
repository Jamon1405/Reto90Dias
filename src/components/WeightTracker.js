'use client';  
import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const WeightTracker = () => {
  const [weightEntries, setWeightEntries] = useState(() => []);
  const [currentWeight, setCurrentWeight] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [weightGoal, setWeightGoal] = useState(75); // Meta de peso por defecto
  const [height, setHeight] = useState(''); // Altura en cm
  const [bodyFat, setBodyFat] = useState(''); // Porcentaje de grasa corporal
  const [idealWeight, setIdealWeight] = useState(0); // Peso ideal calculado
  const [hasInitialData, setHasInitialData] = useState(false); // Para determinar si el usuario ha ingresado los datos iniciales

  // Cargar datos de localStorage cuando el componente está montado
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEntries = localStorage.getItem('weightEntries');
      if (savedEntries) {
        setWeightEntries(JSON.parse(savedEntries));
      }
      const savedInitialData = localStorage.getItem('initialData');
      if (savedInitialData) {
        const data = JSON.parse(savedInitialData);
        setHeight(data.height);
        setBodyFat(data.bodyFat);
        setCurrentWeight(data.currentWeight);
        setIdealWeight(data.idealWeight);
        setWeightGoal(data.weightGoal);
        setHasInitialData(true); // Mostrar los datos si ya fueron ingresados
      }
    }
  }, []);

  // Guardar cambios en weightEntries en localStorage cada vez que cambian
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('weightEntries', JSON.stringify(weightEntries));
    }
  }, [weightEntries]);

  // Guardar los datos iniciales en localStorage
  const saveInitialData = (data) => {
    localStorage.setItem('initialData', JSON.stringify(data));
  };

  // Manejar la entrada del peso
  const handleAddWeight = () => {
    if (currentWeight && selectedDate) {
      setWeightEntries((prevEntries) => [
        ...prevEntries,
        { date: selectedDate, weight: parseFloat(currentWeight) },
      ]);
      setCurrentWeight('');
      setSelectedDate('');
    } else {
      alert("Por favor, introduce una fecha y un peso.");
    }
  };

  // Manejar el borrado de una entrada de peso
  const handleDeleteEntry = (index) => {
    setWeightEntries((prevEntries) => prevEntries.filter((_, i) => i !== index));
  };

  // Calcular el peso ideal utilizando el porcentaje de grasa corporal
  const handleCalculateIdealWeight = () => {
    if (bodyFat && height && currentWeight) {
      const leanBodyMass = (1 - bodyFat / 100) * currentWeight;
      const idealBodyWeight = leanBodyMass / (1 - 0.15); // El 15% es un porcentaje de grasa corporal ideal
      setIdealWeight(idealBodyWeight.toFixed(1));
      setWeightGoal(idealBodyWeight.toFixed(1)); // Actualizar el peso meta basado en el peso ideal
      setHasInitialData(true); // Indica que ya se calcularon los datos iniciales

      // Guardar los datos iniciales en localStorage
      saveInitialData({
        height,
        bodyFat,
        currentWeight,
        idealWeight: idealBodyWeight.toFixed(1),
        weightGoal: idealBodyWeight.toFixed(1),
      });
    } else {
      alert('Por favor, ingresa tu altura, porcentaje de grasa corporal y peso actual.');
    }
  };

  // Reiniciar los datos iniciales y peso guardados en localStorage
  const handleResetData = () => {
    localStorage.removeItem('initialData');
    localStorage.removeItem('weightEntries');
    setHeight('');
    setBodyFat('');
    setCurrentWeight('');
    setIdealWeight(0);
    setWeightGoal(75);
    setWeightEntries([]);
    setHasInitialData(false);
  };

  const initialWeight = weightEntries.length > 0 ? weightEntries[0].weight : 0;
  const currentWeightValue = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : 0;
  const weightDifference = currentWeightValue ? (currentWeightValue - initialWeight).toFixed(1) : '0.0';
  const goalDifference = currentWeightValue ? (currentWeightValue - weightGoal).toFixed(1) : '0.0';

  // Cálculo del peso bajado
  const weightLost = (initialWeight - currentWeightValue).toFixed(1);
  const weightDifferenceColor = goalDifference > 0 ? '#e53935' : '#4caf50'; // Rojo si falta bajar, verde si se pasó la meta

  // Datos del gráfico de línea
  const data = {
    labels: weightEntries.map((entry) => entry.date),
    datasets: [
      {
        label: 'Peso (kg)',
        data: weightEntries.map((entry) => entry.weight),
        borderColor: '#0288d1',
        backgroundColor: 'rgba(2, 136, 209, 0.2)',
        fill: true,
        tension: 0.2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Seguimiento del Peso',
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
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    marginBottom: '15px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  };

  const buttonStyle = {
    backgroundColor: '#0288d1',
    color: '#fff',
    padding: '12px 20px',
    fontSize: '18px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginBottom: '20px',
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Seguimiento del Peso y Calculadora de Peso Ideal</h2>

      <div>
        <h3>Ingresa tus datos iniciales</h3>
        <input
          type="number"
          placeholder="Peso actual (kg)"
          value={currentWeight}
          onChange={(e) => setCurrentWeight(e.target.value)}
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Altura (cm)"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Porcentaje de grasa corporal (%)"
          value={bodyFat}
          onChange={(e) => setBodyFat(e.target.value)}
          style={inputStyle}
        />
        <button onClick={handleCalculateIdealWeight} style={buttonStyle}>
          Calcular Peso Ideal
        </button>

        {idealWeight > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4>Tu peso ideal es: {idealWeight} kg</h4>
            <h4>Tu peso meta ha sido ajustado a: {weightGoal} kg</h4>
          </div>
        )}

        <button onClick={handleResetData} style={{ ...buttonStyle, backgroundColor: '#e53935' }}>
          Reiniciar Datos
        </button>
      </div>

      {hasInitialData && (
        <>
          <div>
            <h3>Registra tu peso</h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={inputStyle}
            />
            <input
              type="number"
              placeholder="Peso (kg)"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              style={inputStyle}
            />
            <button onClick={handleAddWeight} style={buttonStyle}>
              Añadir entrada de peso
            </button>
          </div>

          <div>
            <h3>Progreso</h3>
            <p>Peso Inicial: {initialWeight} kg</p>
            <p>Peso Actual: {currentWeightValue} kg</p>
            <p>Peso Meta: {weightGoal} kg</p>
            <p style={{ color: weightDifferenceColor }}>Falta para Meta: {goalDifference} kg</p>
            <p style={{ color: weightDifferenceColor }}>¡Has bajado!: {Math.abs(weightLost)} kg</p>
          </div>

          <h3>Entradas de Peso</h3>
          <ul>
            {weightEntries.map((entry, index) => (
              <li key={index}>
                {entry.date}: {entry.weight} kg
                <button onClick={() => handleDeleteEntry(index)} style={buttonStyle}>
                  Borrar
                </button>
              </li>
            ))}
          </ul>

          <Line data={data} options={options} />
        </>
      )}
    </div>
  );
};

export default WeightTracker;
