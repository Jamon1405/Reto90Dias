import type { TitanDay } from './types';

const ROUTINE_SEQUENCE = ['PECHO/BICEPS', 'ESPALDA/TRICEPS', 'PIERNA/HOMBRO'] as const;

type RoutineLabel = (typeof ROUTINE_SEQUENCE)[number];

function isTrainingDay(day: TitanDay) {
  const hasWorkout = Boolean(day.workout && day.workout.trim());
  const treadmillCount = day.activity?.treadmill?.length ?? 0;
  const manualCount = day.activity?.manual?.length ?? 0;
  return hasWorkout || treadmillCount + manualCount > 0;
}

export function getRoutineLabel(days: TitanDay[], targetDate: string): RoutineLabel {
  const trainingDays = [...days]
    .filter((day) => day.date <= targetDate && isTrainingDay(day))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  if (trainingDays.length === 0) return ROUTINE_SEQUENCE[0];

  const lastTraining = trainingDays[trainingDays.length - 1];
  const lastIndex = trainingDays.length - 1;
  const baseIndex = lastTraining.date === targetDate ? lastIndex : lastIndex + 1;
  return ROUTINE_SEQUENCE[baseIndex % ROUTINE_SEQUENCE.length];
}
