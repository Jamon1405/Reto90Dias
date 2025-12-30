import { addDays, getAgeFromDob, getTodayStr, getZonedParts } from './date';
import type { TitanDay } from './types';

const HEIGHT_CM = 173;
const DOB = '1997-05-14';

export function computeBmr(weight: number, referenceDate?: Date) {
  if (weight <= 0) return 0;
  const age = getAgeFromDob(DOB, referenceDate);
  return Math.round(10 * weight + 6.25 * HEIGHT_CM - 5 * age + 5);
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

  const nowIsToday = day.date === getTodayStr();
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
