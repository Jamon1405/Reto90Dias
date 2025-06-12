'use client';
import RoutineManager from '@/components/RoutineManager';
import ExerciseProgress from '@/components/ExerciseProgress';

export default function RoutinePage() {
  return (
    <div style={{ transform: 'scale(0.95)', transformOrigin: 'top center' }}>
      <h1>Rutinas Personalizadas</h1>
      <RoutineManager />
      <ExerciseProgress />
    </div>
  );
}
