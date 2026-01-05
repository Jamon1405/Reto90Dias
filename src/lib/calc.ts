import type { DayLog } from './models';
import { addDays, diffDays, getZonedParts, todayISO_MX } from './timezone';

const HEIGHT_CM = 173;
const DOB = '1997-05-14';

export type RiskFlag = { code: 'WEIGHT_UP_ON_DEFICIT' | 'NO_DEFICIT_3D' | 'LOW_WATER_18H'; msg: string };

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

export function computeCalOut({ bmr, extraBurn }: { bmr: number; extraBurn: number }) {
  const baseOut = Math.round(bmr * 1.2);
  return Math.round(baseOut + extraBurn);
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
    flags.push({
      code: 'WEIGHT_UP_ON_DEFICIT',
      msg: 'Peso subió ≥0.2kg con déficit activo.',
    });
  }

  const requiredDates = lastThreeDates(log.dateISO);
  const lastThreeMap = new Map(lastThree.map((entry) => [entry.dateISO, entry]));
  const hasThreeConsecutive = requiredDates.every((date) => lastThreeMap.has(date));
  if (hasThreeConsecutive && requiredDates.every((date) => computeNet(lastThreeMap.get(date)!.calIn, lastThreeMap.get(date)!.calOut) > 0)) {
    flags.push({
      code: 'NO_DEFICIT_3D',
      msg: '3 días consecutivos sin déficit.',
    });
  }

  if (log.dateISO === nowIso) {
    const { hour } = getZonedParts(new Date());
    if (hour >= 18 && log.waterCups < 6) {
      flags.push({
        code: 'LOW_WATER_18H',
        msg: 'Agua baja después de las 18:00.',
      });
    }
  }

  return { flags, net };
}

export function computeRiskFlags(args: Parameters<typeof computeFlags>[0]) {
  return computeFlags(args);
}

export function computeOutBreakdown({
  weightKg,
  extraOut,
  referenceIso = todayISO_MX(),
}: {
  weightKg: number;
  extraOut: number;
  referenceIso?: string;
}) {
  const safeWeight = Number(weightKg) || 0;
  const safeExtra = Number(extraOut) || 0;
  const age = ageFromDob(referenceIso);
  const bmr = computeBmr(safeWeight, referenceIso);
  const baseOut = Math.round(bmr * 1.2);
  const totalOut = Math.round(baseOut + safeExtra);
  return { age, bmr, baseOut, extraOut: safeExtra, totalOut };
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

const ROUTINE_SEQUENCE = ['PECHO/BICEPS', 'ESPALDA/TRICEPS', 'PIERNA/HOMBRO'] as const;

export function getAssignedRoutine(dateISO: string) {
  const seasonStart = '2026-01-05';
  const index = Math.max(0, diffDays(seasonStart, dateISO));
  return ROUTINE_SEQUENCE[index % ROUTINE_SEQUENCE.length];
}
