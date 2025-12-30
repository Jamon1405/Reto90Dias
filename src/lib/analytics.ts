import { addDays, getAgeFromDob, getZonedParts, todayISOInTZ } from './date';
import type { ActivityLog, TitanDay } from './types';

const HEIGHT_CM = 173;
const DOB = '1997-05-14';

export function computeBmr(weight: number, referenceDate?: Date) {
  const targetWeight = weight > 0 ? weight : 97;
  const age = getAgeFromDob(DOB, referenceDate);
  return Math.round(10 * targetWeight + 6.25 * HEIGHT_CM - 5 * age + 5);
}

export function computeBmi(weight: number) {
  const targetWeight = weight > 0 ? weight : 97;
  const heightM = 1.73;
  return Number((targetWeight / (heightM * heightM)).toFixed(1));
}

export function computeNet(calIn: number, calOut: number) {
  return Math.round(calIn - calOut);
}

export function computeTitanScore({ calIn, calOut, water, steps }: TitanDay) {
  const net = computeNet(calIn, calOut);
  const base = net <= 0 ? 40 : 0;
  const waterScore = Math.min(20, Math.round((water / 8) * 20));
  const stepScore = Math.min(20, Math.round((steps / 8000) * 20));
  const burnScore = calOut > 0 ? 20 : 0;
  return Math.min(100, base + waterScore + stepScore + burnScore);
}

export function computeCaloriesIn(macros: TitanDay['macros']) {
  const meat = Number(macros.m ?? 0);
  const eggs = Number(macros.e ?? 0);
  const butter = Number(macros.b ?? 0);
  return Math.round(meat * 2.5 + eggs * 75 + butter * 7.2);
}

export function computeExtraBurn(activity: ActivityLog) {
  const treadmill = activity.treadmill?.reduce((sum, entry) => sum + entry.kcal, 0) ?? 0;
  const manual = activity.manual?.reduce((sum, entry) => sum + entry.kcal, 0) ?? 0;
  return Math.round(treadmill + manual);
}

export function computeCaloriesOut({
  weight,
  activity,
  referenceDate,
}: {
  weight: number;
  activity: ActivityLog;
  referenceDate?: Date;
}) {
  const bmr = computeBmr(weight, referenceDate);
  const extra = computeExtraBurn(activity);
  return Math.round(bmr + extra);
}

const ROUTINE_SEQUENCE = ['PECHO/BICEPS', 'ESPALDA/TRICEPS', 'PIERNA/HOMBRO'] as const;

function isTrainingDay(day: TitanDay) {
  const hasWorkout = Boolean(day.workout && day.workout.trim());
  const treadmillCount = day.activity?.treadmill?.length ?? 0;
  const manualCount = day.activity?.manual?.length ?? 0;
  return hasWorkout || treadmillCount + manualCount > 0;
}

export function computeRoutineLabel(days: TitanDay[], targetDate: string) {
  const trainingDays = [...days]
    .filter((day) => day.date <= targetDate && isTrainingDay(day))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  if (trainingDays.length === 0) {
    return ROUTINE_SEQUENCE[0];
  }

  const lastTraining = trainingDays[trainingDays.length - 1];
  const lastIndex = trainingDays.length - 1;
  const baseIndex = lastTraining.date === targetDate ? lastIndex : lastIndex + 1;
  return ROUTINE_SEQUENCE[baseIndex % ROUTINE_SEQUENCE.length];
}

export function computeFlags({
  day,
  lastWeight,
  previousWeight,
  historyMap,
}: {
  day: TitanDay;
  lastWeight: number;
  previousWeight: number;
  historyMap: Record<string, TitanDay | undefined>;
}) {
  const net = computeNet(day.calIn, day.calOut);
  const weight = day.weight > 0 ? day.weight : lastWeight;
  const list: { code: string; msg: string }[] = [];

  if (day.weight > 0 && previousWeight > 0 && day.weight - previousWeight >= 0.2 && net <= 0) {
    list.push({
      code: 'WEIGHT_UP_ON_DEFICIT',
      msg: 'Peso subió ≥0.2kg con déficit activo.',
    });
  }

  const todayStr = day.date;
  const streakDates = [todayStr, addDays(todayStr, -1), addDays(todayStr, -2)];
  const streak = streakDates.every((date) => {
    const record = historyMap[date];
    if (!record) return false;
    return computeNet(record.calIn, record.calOut) > 0;
  });
  if (streak) {
    list.push({
      code: 'NO_DEFICIT_3D',
      msg: '3 días consecutivos sin déficit.',
    });
  }

  const nowIsToday = day.date === todayISOInTZ();
  const { hour } = getZonedParts();
  if (nowIsToday && hour >= 18 && day.water < 6) {
    list.push({
      code: 'LOW_WATER_18H',
      msg: 'Agua baja después de las 18:00.',
    });
  }

  return {
    list,
    net,
    bmr: computeBmr(weight),
  };
}
