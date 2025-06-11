'use client';

import { useState, useEffect } from 'react';

export default function RoutinesPage() {
  const [prompt, setPrompt] = useState('');
  const [routine, setRoutine] = useState('');
  const [loading, setLoading] = useState(false);
  const [routines, setRoutines] = useState([]);

  const loadRoutines = async () => {
    const res = await fetch('/api/generateRoutine');
    if (res.ok) {
      setRoutines(await res.json());
    }
  };

  useEffect(() => {
    loadRoutines();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setRoutine('');
    const res = await fetch('/api/generateRoutine', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (res.ok) {
      setRoutine(data.description);
      loadRoutines();
    } else {
      alert(data.error || 'Error');
    }
    setLoading(false);
  };

  const containerStyle = {
    padding: '20px',
    backgroundColor: '#f0f0f0',
    borderRadius: '15px',
    margin: 'auto',
    textAlign: 'center',
    maxWidth: '1000px',
  };

  const headerStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  };

  const buttonStyle = {
    backgroundColor: '#0288d1',
    color: '#fff',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    margin: '10px 5px',
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Rutinas</h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe tus objetivos"
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }}
      />
      <br />
      <button onClick={handleGenerate} style={buttonStyle} disabled={loading}>
        {loading ? 'Generando...' : 'Generar Rutina'}
      </button>

      {routine && (
        <div style={{ textAlign: 'left', marginTop: '20px' }}>
          <h3>Rutina generada</h3>
          <pre>{routine}</pre>
        </div>
      )}

      <div style={{ textAlign: 'left', marginTop: '20px' }}>
        <h3>Rutinas guardadas</h3>
        <ul>
          {routines.map((r) => (
            <li key={r.id}>{r.description}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
