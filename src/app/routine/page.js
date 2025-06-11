'use client';
import RoutineManager from '@/components/RoutineManager';
import ExerciseProgress from '@/components/ExerciseProgress';

export default function RoutinePage() {
  return (
    <div>
      <h1>Rutinas Personalizadas</h1>
      <RoutineManager />
      <ExerciseProgress />
    </div>
  );
}
