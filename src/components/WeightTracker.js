'use client';  
import { useState, useEffect } from 'react';
import useCurrentUser from '../hooks/useCurrentUser';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const WeightTracker = () => {
  const [weightEntries, setWeightEntries] = useState(() => []);
  const [currentWeight, setCurrentWeight] = useState('');
  const [entryWeight, setEntryWeight] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [weightGoal, setWeightGoal] = useState(75); // Meta de peso por defecto
  const [height, setHeight] = useState(''); // Altura en cm
  const [bodyFat, setBodyFat] = useState(''); // Porcentaje de grasa corporal
  const [idealWeight, setIdealWeight] = useState(0); // Peso ideal calculado
  const [gender, setGender] = useState('male'); // Sexo del usuario
  const [hasInitialData, setHasInitialData] = useState(false); // Para determinar si el usuario ha ingresado los datos iniciales

  const user = useCurrentUser();

  // Cargar datos de localStorage cuando el componente está montado
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEntries = localStorage.getItem(`weightEntries_${user}`);
      if (savedEntries) {
        setWeightEntries(JSON.parse(savedEntries));
      }
      const savedInitialData = localStorage.getItem(`initialData_${user}`);
      if (savedInitialData) {
        const data = JSON.parse(savedInitialData);
        setHeight(data.height);
        setBodyFat(data.bodyFat);
        setCurrentWeight(data.currentWeight);
        setIdealWeight(data.idealWeight);
        setWeightGoal(data.weightGoal);
        setGender(data.gender || 'male');
        setHasInitialData(true); // Mostrar los datos si ya fueron ingresados
      }
    }
  }, [user]);

  // Guardar cambios en weightEntries en localStorage cada vez que cambian
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `weightEntries_${user}`,
        JSON.stringify(weightEntries)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weightEntries]);

  // Guardar los datos iniciales en localStorage
  const saveInitialData = (data) => {
    localStorage.setItem(`initialData_${user}`, JSON.stringify(data));
  };

  // Manejar la entrada del peso
  const handleAddWeight = () => {
    if (entryWeight && selectedDate) {
      setWeightEntries((prevEntries) => [
        ...prevEntries,
        { date: selectedDate, weight: parseFloat(entryWeight) },
      ]);
      setEntryWeight('');
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
      const idealFat = gender === 'male' ? 15 : 22; // Porcentaje de grasa ideal según sexo
      const idealBodyWeight = leanBodyMass / (1 - idealFat / 100);
      setIdealWeight(idealBodyWeight.toFixed(1));
      setWeightGoal(idealBodyWeight.toFixed(1)); // Actualizar el peso meta basado en el peso ideal
      setHasInitialData(true); // Indica que ya se calcularon los datos iniciales

      // Guardar los datos iniciales en localStorage
      saveInitialData({
        height,
        bodyFat,
        currentWeight,
        gender,
        idealWeight: idealBodyWeight.toFixed(1),
        weightGoal: idealBodyWeight.toFixed(1),
      });
    } else {
      alert('Por favor, ingresa tu altura, porcentaje de grasa corporal y peso actual.');
    }
  };

  // Reiniciar los datos iniciales y peso guardados en localStorage
  const handleResetData = () => {
    localStorage.removeItem(`initialData_${user}`);
    localStorage.removeItem(`weightEntries_${user}`);
    setHeight('');
    setBodyFat('');
    setCurrentWeight('');
    setEntryWeight('');
    setIdealWeight(0);
    setWeightGoal(75);
    setGender('male');
    setWeightEntries([]);
    setHasInitialData(false);
  };

  const initialWeight = weightEntries.length > 0 ? weightEntries[0].weight : 0;
  const currentWeightValue = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : 0;
  const weightDifference = currentWeightValue ? (currentWeightValue - initialWeight).toFixed(1) : '0.0';
  const goalDifference = currentWeightValue ? (currentWeightValue - weightGoal).toFixed(1) : '0.0';

  // Cálculo del peso bajado
  const weightLost = (initialWeight - currentWeightValue).toFixed(1);
  const weightDifferenceColor = goalDifference > 0 ? '#FF453A' : '#30D158'; // Rojo si falta bajar, verde si se pasó la meta

  // Datos del gráfico de línea
  const data = {
    labels: weightEntries.map((entry) => entry.date),
    datasets: [
      {
        label: 'Peso (kg)',
        data: weightEntries.map((entry) => entry.weight),
        borderColor: '#f5f5f7',
        backgroundColor: 'rgba(10,132,255,0.2)',
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
    padding: '24px',
    margin: '30px auto',
    maxWidth: '430px',
    width: '100%',
    textAlign: 'center',
    backgroundColor: 'var(--background-card)',
    borderRadius: '20px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  };

  const headerStyle = {
    fontSize: '32px',
    fontWeight: '600',
    marginBottom: '30px',
    color: '#f5f5f7',
    fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    borderRadius: '10px',
    border: '1px solid #2C2C2E',
    marginBottom: '15px',
    backgroundColor: '#1C1C1E',
    color: '#f5f5f7',
  };

  const buttonStyle = {
    backgroundColor: 'var(--accent-color)',
    color: '#FFFFFF',
    padding: '8px 14px',
    fontSize: '16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    boxShadow: 'none',
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
          enterKeyHint="next"
        />
        <input
          type="number"
          placeholder="Altura (cm)"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          style={inputStyle}
          enterKeyHint="next"
        />
        <input
          type="number"
          placeholder="Porcentaje de grasa corporal (%)"
          value={bodyFat}
          onChange={(e) => setBodyFat(e.target.value)}
          style={inputStyle}
          enterKeyHint="next"
        />
        <select value={gender} onChange={(e) => setGender(e.target.value)} style={inputStyle}>
          <option value="male">Hombre</option>
          <option value="female">Mujer</option>
        </select>
        <button onClick={handleCalculateIdealWeight} style={buttonStyle} aria-label="Calcular peso ideal">
          Calcular Peso Ideal
        </button>

        {idealWeight > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4>Tu peso ideal es: {idealWeight} kg</h4>
            <h4>Tu peso meta ha sido ajustado a: {weightGoal} kg</h4>
          </div>
        )}

        <button
          onClick={handleResetData}
          style={{ ...buttonStyle, backgroundColor: '#FF453A' }}
          aria-label="Reiniciar datos"
        >
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
              enterKeyHint="next"
            />
            <input
              type="number"
              placeholder="Peso (kg)"
              value={entryWeight}
              onChange={(e) => setEntryWeight(e.target.value)}
              style={inputStyle}
              enterKeyHint="done"
            />
            <button onClick={handleAddWeight} style={buttonStyle} aria-label="Añadir peso">
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
          <ul style={{ padding: 0, listStyle: 'none' }}>
            {weightEntries.map((entry, index) => (
              <li
                key={index}
                style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}
              >
                <span style={{ flexGrow: 1 }}>
                  {entry.date}: {entry.weight} kg
                </span>
                <button
                  onClick={() => handleDeleteEntry(index)}
                  style={{ ...buttonStyle, marginLeft: '10px' }}
                  aria-label="Borrar entrada"
                >
                  Borrar
                </button>
              </li>
            ))}
          </ul>

          <div style={{ height: '300px', maxWidth: '600px', margin: '0 auto' }}>
            <Line data={data} options={options} />
          </div>
        </>
      )}
    </div>
  );
};

export default WeightTracker;
