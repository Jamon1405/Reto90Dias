'use client';  // Esto indica que este componente solo debe ejecutarse en el cliente
import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const WeightTracker = () => {
  const [weightEntries, setWeightEntries] = useState(() => []);
  const [currentWeight, setCurrentWeight] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [weightGoal, setWeightGoal] = useState(75); // Meta de peso
  const [height, setHeight] = useState(''); // Altura en cm
  const [bodyFat, setBodyFat] = useState(''); // Porcentaje de grasa corporal
  const [idealWeight, setIdealWeight] = useState(0); // Peso ideal calculado

  // Este useEffect carga los datos de localStorage cuando el componente está montado
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEntries = localStorage.getItem('weightEntries');
      if (savedEntries) {
        setWeightEntries(JSON.parse(savedEntries));
      }
    }
  }, []);

  // Este useEffect guarda los cambios en weightEntries en localStorage cada vez que cambian
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('weightEntries', JSON.stringify(weightEntries));
    }
  }, [weightEntries]);

  const handleAddWeight = () => {
    if (currentWeight && selectedDate) {
      setWeightEntries((prevEntries) => [
        ...prevEntries,
        { date: selectedDate, weight: parseFloat(currentWeight) },
      ]);
      setCurrentWeight('');
      setSelectedDate('');
    }
  };

  const handleDeleteEntry = (index) => {
    setWeightEntries((prevEntries) => prevEntries.filter((_, i) => i !== index));
  };

  const initialWeight = weightEntries.length > 0 ? weightEntries[0].weight : 0;
  const currentWeightValue = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : 0;
  const weightDifference = currentWeightValue ? (currentWeightValue - initialWeight).toFixed(1) : '0.0';
  const goalDifference = currentWeightValue ? (currentWeightValue - weightGoal).toFixed(1) : '0.0';

  // Variar el color según la diferencia de peso
  const weightDifferenceColor = goalDifference > 0 ? '#e53935' : '#4caf50'; // Rojo si falta bajar, verde si se pasó la meta

  // Cálculo del peso bajado
  const weightLost = (initialWeight - currentWeightValue).toFixed(1);
  const weightLostColor = weightLost > 0 ? '#4caf50' : '#e53935'; // Verde si ha bajado peso, rojo si ha subido

  // Cálculo del peso ideal utilizando el porcentaje de grasa corporal
  const handleCalculateIdealWeight = () => {
    if (bodyFat && height) {
      const fatFreeMassIndex = 1 - bodyFat / 100;
      const idealBodyWeight = (height - 100) * fatFreeMassIndex;
      setIdealWeight(idealBodyWeight.toFixed(1));
    } else {
      alert('Por favor, ingresa tu altura y porcentaje de grasa corporal.');
    }
  };

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

  const buttonDeleteStyle = {
    backgroundColor: '#e53935',
    color: '#fff',
    padding: '6px 12px',
    fontSize: '14px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  };

  const entryListStyle = {
    listStyleType: 'none',
    padding: 0,
    margin: '20px 0',
  };

  const entryItemStyle = {
    padding: '10px 15px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Seguimiento del Peso y Calculadora de Peso Ideal</h2>

      <div>
        <div>
          <p>Peso Inicial: {initialWeight} kg</p>
          <p>Peso Actual: {currentWeightValue} kg</p>
          <p>Peso Meta: {weightGoal} kg</p>
          <p style={{ color: weightDifferenceColor }}>Falta para Meta: {goalDifference} kg</p>
          <p style={{ color: weightLostColor }}>¡Has bajado!: {Math.abs(weightLost)} kg</p>
        </div>
      </div>

      <div>
        <label htmlFor="date">Selecciona el día: </label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={inputStyle}
        />
      </div>
      <div>
        <label htmlFor="weight">Introduce tu peso (kg): </label>
        <input
          type="number"
          id="weight"
          value={currentWeight}
          onChange={(e) => setCurrentWeight(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label>Altura (cm):</label>
        <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} style={inputStyle} />
      </div>

      <div>
        <label>Porcentaje de Grasa Corporal (%):</label>
        <input type="number" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} style={inputStyle} />
      </div>

      <button onClick={handleCalculateIdealWeight} style={buttonStyle}>
        Calcular Peso Ideal
      </button>

      {idealWeight > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4>Tu peso ideal es: {idealWeight} kg</h4>
        </div>
      )}

      <button onClick={handleAddWeight} style={buttonStyle}>
        Añadir entrada
      </button>

      <h3>Entradas de Peso</h3>
      <ul style={entryListStyle}>
        {weightEntries.map((entry, index) => (
          <li key={index} style={entryItemStyle}>
            {entry.date}: {entry.weight} kg
            <button onClick={() => handleDeleteEntry(index)} style={buttonDeleteStyle}>Borrar</button>
          </li>
        ))}
      </ul>

      <Line data={data} options={options} />
    </div>
  );
};

export default WeightTracker;
