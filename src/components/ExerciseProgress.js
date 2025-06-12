'use client';
import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import useCurrentUser from '../hooks/useCurrentUser';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const buttonStyle = {
  backgroundColor: 'var(--accent-color)',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '8px',
  padding: '6px 12px',
  cursor: 'pointer',
  fontSize: '14px',
  boxShadow: 'none',
  transition: 'background-color 0.3s',
};

const ExerciseProgress = () => {
  const user = useCurrentUser();
  const [progress, setProgress] = useState({});
  const [selected, setSelected] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(`exerciseProgress_${user}`);
    setProgress(saved ? JSON.parse(saved) : {});
  }, [user]);

  const handleDeleteExercise = () => {
    if (!selected) return;
    setProgress((prev) => {
      const updated = { ...prev };
      delete updated[selected];
      localStorage.setItem(`exerciseProgress_${user}`, JSON.stringify(updated));
      return updated;
    });
    setSelected('');
  };

  const handleDeleteAll = () => {
    localStorage.removeItem(`exerciseProgress_${user}`);
    setProgress({});
    setSelected('');
  };

  const data =
    selected && progress[selected]
      ? {
          labels: progress[selected].map((p) => p.date),
          datasets: [
            {
              label: `${selected} (lb)`,
              data: progress[selected].map((p) => p.weight),
              borderColor: '#f5f5f7',
              fill: false,
              tension: 0.2,
              pointRadius: 4,
              borderWidth: 2,
            },
          ],
        }
      : null;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      x: {
        ticks: { color: '#f5f5f7' },
        grid: { color: '#2C2C2E' },
      },
      y: {
        ticks: { color: '#f5f5f7' },
        grid: { color: '#2C2C2E' },
      },
    },
  };

  return (
    <div
      style={{
        marginTop: '20px',
        textAlign: 'center',
        maxWidth: '430px',
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      <h3>Progreso por Ejercicio</h3>
      {Object.keys(progress).length === 0 && <p>No hay datos registrados.</p>}
      {Object.keys(progress).length > 0 && (
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            marginBottom: '10px',
            width: '100%',
            fontSize: '16px',
          }}
        >
          <option value="" disabled>
            Selecciona ejercicio
          </option>
          {Object.keys(progress).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      )}
      {data && (
        <div style={{ height: '300px', maxWidth: '600px', margin: '0 auto' }}>
          <Line data={data} options={options} />
        </div>
      )}
      {Object.keys(progress).length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <button
            type="button"
            aria-label="Borrar ejercicio"
            onClick={handleDeleteExercise}
            style={{ ...buttonStyle, backgroundColor: '#FF453A', marginRight: '10px' }}
          >
            Borrar ejercicio
          </button>
          <button
            type="button"
            aria-label="Borrar todo"
            onClick={handleDeleteAll}
            style={{ ...buttonStyle, backgroundColor: '#FF453A' }}
          >
            Borrar todo
          </button>
        </div>
      )}
    </div>
  );
};

export default ExerciseProgress;
