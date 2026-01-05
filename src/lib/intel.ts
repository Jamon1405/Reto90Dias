import type { DayLog } from './models';
import { computeNet } from './calc';
import { diffDays, todayISO_MX } from './timezone';

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function pickLastN(days: DayLog[], count: number) {
  return [...days].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1)).slice(0, count);
}

export function computeIntel(days: DayLog[]) {
  const sorted = [...days].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1));
  const last7 = pickLastN(sorted, 7);
  const last14 = pickLastN(sorted, 14);
  const last30 = pickLastN(sorted, 30);

  const nets = sorted.map((day) => computeNet(day.calIn, day.calOut));
  const net7 = last7.reduce((sum, day) => sum + computeNet(day.calIn, day.calOut), 0);
  const net14 = last14.reduce((sum, day) => sum + computeNet(day.calIn, day.calOut), 0);
  const net30 = last30.reduce((sum, day) => sum + computeNet(day.calIn, day.calOut), 0);

  const avgWeight = average(last7.map((day) => day.weightKg).filter((value) => value > 0));
  const avgSteps = average(last7.map((day) => day.steps));
  const avgWater = average(last7.map((day) => day.waterCups));
  const avgSleep = average(last7.map((day) => day.sleepHours));
  const avgNet = average(last7.map((day) => computeNet(day.calIn, day.calOut)));
  const avgScore = average(last7.map((day) => day.titanScore));

  const weightTrend7 = trendDelta(last7, 'weightKg');
  const weightTrend14 = trendDelta(last14, 'weightKg');
  const weightTrend30 = trendDelta(last30, 'weightKg');

  const rollingNetAvg = average(pickLastN(sorted, 7).map((day) => computeNet(day.calIn, day.calOut)));

  const totalDeficit = sorted.reduce((sum, day) => sum + Math.max(0, -computeNet(day.calIn, day.calOut)), 0);
  const estimatedKgLost = totalDeficit / 7700;

  const today = todayISO_MX();
  const daysToTarget = diffDays(today, '2026-03-15');
  const dailyNetAvg14 = average(last14.map((day) => computeNet(day.calIn, day.calOut)));
  const projectedKgChange = (dailyNetAvg14 * daysToTarget) / 7700;
  const lastWeight = sorted.find((day) => day.weightKg > 0)?.weightKg ?? 0;
  const projectedWeight = lastWeight + projectedKgChange;

  const complianceWindow = last30.length || sorted.length ? last30 : sorted;
  const compliance = {
    water: percent(complianceWindow, (day) => day.waterCups >= 8),
    steps: percent(complianceWindow, (day) => day.steps >= 8000),
    deficit: percent(complianceWindow, (day) => computeNet(day.calIn, day.calOut) <= 0),
  };

  const deficitStreak = streakCount(sorted, (day) => computeNet(day.calIn, day.calOut) <= 0);
  const hydrationStreak = streakCount(sorted, (day) => day.waterCups >= 8);

  return {
    nets: { net7, net14, net30 },
    averages: { avgWeight, avgSteps, avgWater, avgSleep, avgNet, avgScore },
    trends: { weightTrend7, weightTrend14, weightTrend30, rollingNetAvg },
    projection: { estimatedKgLost, projectedWeight, daysToTarget, dailyNetAvg14 },
    compliance,
    streaks: { deficitStreak, hydrationStreak },
  };
}

function trendDelta(days: DayLog[], key: 'weightKg') {
  if (days.length < 2) return 0;
  const sorted = [...days].sort((a, b) => (a.dateISO < b.dateISO ? -1 : 1));
  const first = sorted[0][key];
  const last = sorted[sorted.length - 1][key];
  if (first === 0 || last === 0) return 0;
  return Number((last - first).toFixed(2));
}

function percent(days: DayLog[], predicate: (day: DayLog) => boolean) {
  if (!days.length) return 0;
  const count = days.filter(predicate).length;
  return Math.round((count / days.length) * 100);
}

function streakCount(days: DayLog[], predicate: (day: DayLog) => boolean) {
  const sorted = [...days].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1));
  let streak = 0;
  for (const day of sorted) {
    if (!predicate(day)) break;
    streak += 1;
  }
  return streak;
}
