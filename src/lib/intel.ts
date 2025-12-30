import { addDays, todayISOInTZ } from './date';
import { average, computeNet } from './analytics';
import type { TitanDay } from './types';
import { SEASON_BOUNDARIES } from './phase';

function daysInMonth(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const nextMonth = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  const endDate = new Date(Date.UTC(nextMonth.year, nextMonth.month - 1, 0));
  const end = `${endDate.getUTCFullYear()}-${String(endDate.getUTCMonth() + 1).padStart(2, '0')}-${String(
    endDate.getUTCDate(),
  ).padStart(2, '0')}`;
  return { start, end };
}

export function computeMonthlyPnL(days: TitanDay[], monthKey: string) {
  const { start, end } = daysInMonth(monthKey);
  const monthDays = days.filter((day) => day.date >= start && day.date <= end);
  const totalIn = monthDays.reduce((sum, day) => sum + day.calIn, 0);
  const totalOut = monthDays.reduce((sum, day) => sum + day.calOut, 0);
  const totalNet = totalIn - totalOut;
  const daysLogged = monthDays.length;
  const deficitDays = monthDays.filter((day) => computeNet(day.calIn, day.calOut) <= 0).length;
  const avgNet = daysLogged > 0 ? Math.round(totalNet / daysLogged) : 0;
  return { totalIn, totalOut, totalNet, daysLogged, deficitDays, avgNet };
}

export function computeDeficitBank(days: TitanDay[]) {
  const deficitAccumulated = days.reduce((sum, day) => sum + Math.max(0, -computeNet(day.calIn, day.calOut)), 0);
  const estimatedKgLostIfMaintained = deficitAccumulated / 7700;
  const last7 = [...days]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 7);
  const dailyDeficits = last7.map((day) => Math.max(0, -computeNet(day.calIn, day.calOut)));
  const dailyDeficitAvg7 = average(dailyDeficits);
  return { deficitAccumulated, estimatedKgLostIfMaintained, dailyDeficitAvg7 };
}

export function computeProjection(days: TitanDay[], currentWeight: number) {
  const { dailyDeficitAvg7 } = computeDeficitBank(days);
  if (dailyDeficitAvg7 <= 0) {
    return { dailyDeficitAvg7, projections: null as null | Record<string, number> };
  }
  const kcalPerKg = 7700;
  const projections = {
    '5kg': Math.ceil((5 * kcalPerKg) / dailyDeficitAvg7),
    '10kg': Math.ceil((10 * kcalPerKg) / dailyDeficitAvg7),
    toTarget: Math.ceil(((currentWeight - 77) * kcalPerKg) / dailyDeficitAvg7),
  };
  return { dailyDeficitAvg7, projections };
}

export function computeRiskSummary(days: TitanDay[]) {
  const last14 = [...days].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 14);
  const counts = {
    WEIGHT_UP_ON_DEFICIT: 0,
    NO_DEFICIT_3D: 0,
    LOW_WATER_18H: 0,
  };
  for (const day of last14) {
    for (const flag of day.flags.list) {
      if (flag.code in counts) {
        counts[flag.code as keyof typeof counts] += 1;
      }
    }
  }
  return counts;
}

export function computeMissingDays(days: TitanDay[]) {
  const start = '2025-12-30';
  const today = todayISOInTZ();
  const set = new Set(days.map((day) => day.date));
  let cursor = start;
  let missing = 0;
  while (cursor <= today) {
    if (!set.has(cursor)) missing += 1;
    cursor = addDays(cursor, 1);
  }
  return missing;
}

export function computeWaterCompliance(days: TitanDay[]) {
  const last7 = [...days].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 7);
  if (last7.length === 0) return 0;
  const compliant = last7.filter((day) => day.water >= 8).length;
  return Math.round((compliant / last7.length) * 100);
}

export function computeWeightTrend(days: TitanDay[]) {
  const sorted = [...days].filter((day) => day.weight > 0).sort((a, b) => (a.date < b.date ? -1 : 1));
  return sorted.map((day) => day.weight);
}

export function runwayData(todayStr: string) {
  return {
    todayStr,
    ...SEASON_BOUNDARIES,
  };
}
