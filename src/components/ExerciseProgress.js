'use client';
import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import useCurrentUser from '../hooks/useCurrentUser';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const ExerciseProgress = () => {
  const user = useCurrentUser();
  const [progress, setProgress] = useState({});
  const [selected, setSelected] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(`exerciseProgress_${user}`);
    setProgress(saved ? JSON.parse(saved) : {});
  }, [user]);

  const data = selected && progress[selected] ? {
    labels: progress[selected].map(p => p.date),
    datasets: [{
      label: `${selected} (kg)`,
      data: progress[selected].map(p => p.weight),
      borderColor: '#0288d1',
      fill: false,
    }]
  } : null;

  return (
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
      <h3>Progreso por Ejercicio</h3>
      {Object.keys(progress).length === 0 && <p>No hay datos registrados.</p>}
      {Object.keys(progress).length > 0 && (
        <select value={selected} onChange={e => setSelected(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '10px' }}>
          <option value="" disabled>Selecciona ejercicio</option>
          {Object.keys(progress).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      )}
      {data && <Line data={data} />}
    </div>
  );
};

export default ExerciseProgress;
