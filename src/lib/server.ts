import type { TitanDay } from './types';
import { computeBmr, computeFlags, computeNet, computeTitanScore } from './analytics';
import { getZonedParts } from './date';

export function mapRow(row: any): TitanDay {
  return {
    date: row.date,
    tsUpdated: row.tsUpdated ?? null,
    weight: row.weight ?? 0,
    waist: row.waist ?? 0,
    workout: row.workout ?? '',
    calIn: row.calIn ?? 0,
    calOut: row.calOut ?? 0,
    water: row.water ?? 0,
    suppsJson: (row.suppsJson as Record<string, boolean>) ?? {},
    macrosJson: (row.macrosJson as Record<string, number>) ?? {},
    fastHours: row.fastHours ?? 0,
    steps: row.steps ?? 0,
    notes: row.notes ?? '',
    activityJson: (row.activityJson as { entries?: { label: string; minutes: number; calories: number }[] }) ?? {},
    titanScore: row.titanScore ?? 0,
    flagsJson: (row.flagsJson as { list: { code: string; msg: string }[]; bmr: number; net: number }) ?? null,
  };
}

export function buildFlags(
  day: TitanDay,
  lastWeight: number,
  previousWeight: number,
  historyMap: Record<string, TitanDay | undefined>,
) {
  const parts = getZonedParts();
  const isAfter18 = parts.hour >= 18;
  const todayStr = `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
  const flags = computeFlags({
    day,
    lastWeight,
    previousWeight,
    historyMap,
  });
  if (!(isAfter18 && day.date === todayStr)) {
    flags.list = flags.list.filter((flag) => flag.code !== 'LOW_WATER_18H');
  }
  return flags;
}

export function computeGymCalOut(weight: number, activityJson: { entries?: { calories: number }[] }) {
  const bmr = computeBmr(weight);
  const extra = activityJson.entries?.reduce((sum, entry) => sum + entry.calories, 0) ?? 0;
  return Math.round(bmr * 1.2 + extra);
}

export function computeFuelCalories(macrosJson: Record<string, number>) {
  const meat = Number(macrosJson.meatGrams ?? 0);
  const eggs = Number(macrosJson.eggs ?? 0);
  const butter = Number(macrosJson.butterGrams ?? 0);
  return Math.round(meat * 2.5 + eggs * 75 + butter * 7.2);
}

export function computeDashboardFields(day: TitanDay) {
  const net = computeNet(day.calIn, day.calOut);
  return {
    net,
    titanScoreComputed: computeTitanScore(day),
  };
}
