import type { DayLog } from './models';
import { addDays, diffDays, getZonedParts, todayISO_MX } from './timezone';

const HEIGHT_CM = 173;
const DOB = '1997-05-14';

export type RiskFlag = 'WEIGHT_UP_ON_DEFICIT' | 'NO_DEFICIT_3D' | 'LOW_WATER_18H';

export function ageFromDob(referenceIso: string) {
  const [year, month, day] = referenceIso.split('-').map(Number);
  const [dobYear, dobMonth, dobDay] = DOB.split('-').map(Number);
  let age = year - dobYear;
  if (month < dobMonth || (month === dobMonth && day < dobDay)) {
    age -= 1;
  }
  return age;
}

export function computeBmr(weightKg: number, referenceIso = todayISO_MX()) {
  const weight = weightKg > 0 ? weightKg : 97;
  const age = ageFromDob(referenceIso);
  return Math.round(10 * weight + 6.25 * HEIGHT_CM - 5 * age + 5);
}

export function computeCalIn(macros: { p: number; c: number; f: number }) {
  return Math.round(macros.p * 4 + macros.c * 4 + macros.f * 9);
}

export function computeCalOut({ bmr, extraBurn, gymOut = 0 }: { bmr: number; extraBurn: number; gymOut?: number }) {
  const baseOut = Math.round(bmr * 1.2);
  return Math.round(baseOut + extraBurn + gymOut);
}

export function computeNet(calIn: number, calOut: number) {
  return Math.round(calIn - calOut);
}

export function computeTitanScore({ net, waterCups, steps, calOut }: { net: number; waterCups: number; steps: number; calOut: number }) {
  const base = net <= 0 ? 40 : 0;
  const hydration = Math.min(1, waterCups / 8) * 20;
  const stepsScore = Math.min(1, steps / 8000) * 20;
  const burnScore = calOut > 0 ? 20 : 0;
  return Math.round(Math.min(100, base + hydration + stepsScore + burnScore));
}

export function computeFlags({
  log,
  previousWeight,
  lastThree,
  nowIso,
}: {
  log: DayLog;
  previousWeight: number | null;
  lastThree: DayLog[];
  nowIso: string;
}) {
  const flags: RiskFlag[] = [];
  const net = computeNet(log.calIn, log.calOut);

  if (log.weightKg > 0 && previousWeight && net <= 0 && log.weightKg > previousWeight + 0.2) {
    flags.push('WEIGHT_UP_ON_DEFICIT');
  }

  const requiredDates = lastThreeDates(log.dateISO);
  const lastThreeMap = new Map(lastThree.map((entry) => [entry.dateISO, entry]));
  const hasThreeConsecutive = requiredDates.every((date) => lastThreeMap.has(date));
  if (hasThreeConsecutive && requiredDates.every((date) => computeNet(lastThreeMap.get(date)!.calIn, lastThreeMap.get(date)!.calOut) > 0)) {
    flags.push('NO_DEFICIT_3D');
  }

  if (log.dateISO === nowIso) {
    const { hour } = getZonedParts(new Date());
    if (hour >= 18 && log.waterCups < 6) {
      flags.push('LOW_WATER_18H');
    }
  }

  return { flags, net };
}

export function computeRiskFlags(args: Parameters<typeof computeFlags>[0]) {
  return computeFlags(args);
}

export function formatRiskFlags(flags: RiskFlag[]) {
  return flags.map((flag) => {
    if (flag === 'WEIGHT_UP_ON_DEFICIT') return 'Peso subió ≥0.2kg con déficit activo.';
    if (flag === 'NO_DEFICIT_3D') return '3 días consecutivos sin déficit.';
    if (flag === 'LOW_WATER_18H') return 'Agua baja después de las 18:00.';
    return flag;
  });
}

export function computeGymCals({
  weightKg,
  minutes,
  gymType,
}: {
  weightKg: number;
  minutes: number;
  gymType: 'WEIGHTS' | 'INCLINE_TREADMILL' | 'MIXED';
}) {
  const met = 6.0;
  const weight = Number(weightKg) || 97;
  const mins = Number(minutes) || 0;
  return Math.round((met * 3.5 * weight * mins) / 200);
}

export function computeOutBreakdown({
  weightKg,
  gymMinutes,
  gymType,
  extraOut,
  referenceIso = todayISO_MX(),
}: {
  weightKg: number;
  gymMinutes: number;
  gymType: 'WEIGHTS' | 'INCLINE_TREADMILL' | 'MIXED';
  extraOut: number;
  referenceIso?: string;
}) {
  const safeWeight = Number(weightKg) || 0;
  const safeExtra = Number(extraOut) || 0;
  const age = ageFromDob(referenceIso);
  const bmr = computeBmr(safeWeight, referenceIso);
  const baseOut = Math.round(bmr * 1.2);
  const gymOut = computeGymCals({ weightKg: safeWeight, minutes: gymMinutes, gymType });
  const totalOut = Math.round(baseOut + gymOut + safeExtra);
  return { age, bmr, baseOut, gymOut, extraOut: safeExtra, totalOut };
}

export function lastThreeDates(targetDate: string) {
  return [targetDate, addDays(targetDate, -1), addDays(targetDate, -2)];
}

export function seasonForDate(targetDate: string) {
  return targetDate < '2026-01-05' ? 'PRE-SEASON' : 'SEASON';
}

export function daysLeftToTarget(today: string, target = '2026-03-15') {
  return Math.max(0, Math.ceil((new Date(target).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)));
}

export function ensureTodayClamp(dateISO: string) {
  const today = todayISO_MX();
  return dateISO > today ? today : dateISO;
}

const ROUTINE_SEQUENCE = [
  'REST',
  'CHEST / BICEPS',
  'BACK / TRICEPS',
  'LEGS / SHOULDERS',
  'CHEST / BICEPS',
  'BACK / TRICEPS',
  'LEGS / SHOULDERS',
] as const;

export function getAssignedRoutine(dateISO: string) {
  const seasonStart = '2026-01-05';
  const index = diffDays(seasonStart, dateISO);
  if (index < 0) return 'REST';
  return ROUTINE_SEQUENCE[index % 7];
}
