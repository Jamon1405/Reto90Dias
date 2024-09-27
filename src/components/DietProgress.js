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

  // Este useEffect carga los datos de localStorage cuando el componente está montado
  useEffect(() => {
    const savedDays = localStorage.getItem('days');
    if (savedDays) {
      setDays(JSON.parse(savedDays));
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

  const fastingInputStyle = {
    padding: '10px',
    fontSize: '14px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    margin: '10px 0',
    width: '60%',
  };

  const infoContainerStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '20px',
  };

  const infoBoxStyle = {
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
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
      <h2 style={headerStyle}>Progreso de la Dieta - 90 días</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
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
          <h3>
            Día {selectedDay + 1} - {days[selectedDay].dietCompleted ? 'Dieta cumplida' : 'Dieta no cumplida'}
          </h3>

          <div style={{ marginTop: '20px' }}>
            <label htmlFor="fasting">Introduce tus horas de ayuno:</label>
            <input
              type="number"
              id="fasting"
              value={fastingHours}
              onChange={handleFastingHoursChange}
              style={fastingInputStyle}
            />
            <button onClick={handleSaveFastingHours} style={buttonStyle}>
              Guardar Ayuno y Completar Día
            </button>
          </div>
        </div>
      )}

      <h3>Indicadores</h3>
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
