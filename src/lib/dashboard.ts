import { prisma } from './db';
import { addDays, getAgeFromDob, getMonthRange, getNowIso, getTodayStr } from './date';
import { computeBmr, computeNet, computeTitanScore } from './analytics';
import { buildFlags, mapRow } from './server';

const TARGET_DATE = '2026-03-15';
const SEASON_START = '2026-01-05';

function diffDays(from: string, to: string) {
  const [fromYear, fromMonth, fromDay] = from.split('-').map(Number);
  const [toYear, toMonth, toDay] = to.split('-').map(Number);
  const fromUtc = Date.UTC(fromYear, fromMonth - 1, fromDay);
  const toUtc = Date.UTC(toYear, toMonth - 1, toDay);
  return Math.ceil((toUtc - fromUtc) / (1000 * 60 * 60 * 24));
}

function createEmptyDay(date: string) {
  return {
    date,
    tsUpdated: null,
    weight: 0,
    waist: 0,
    workout: '',
    calIn: 0,
    calOut: 0,
    water: 0,
    suppsJson: {},
    macrosJson: {},
    fastHours: 0,
    steps: 0,
    notes: '',
    activityJson: { entries: [] },
    titanScore: 0,
    flagsJson: { list: [], bmr: 0, net: 0 },
  };
}

export async function buildDashboardResponse(date?: string) {
  const todayStr = getTodayStr();
  const targetDate = date ?? todayStr;

  const [fastState, dayRow, lastWeightRow, previousWeightRow] = await Promise.all([
    prisma.titanState.findUnique({ where: { key: 'fast_start_ms' } }),
    prisma.titanDay.findUnique({ where: { date: targetDate } }),
    prisma.titanDay.findFirst({
      where: { weight: { gt: 0 }, date: { lte: targetDate } },
      orderBy: { date: 'desc' },
    }),
    prisma.titanDay.findFirst({
      where: { weight: { gt: 0 }, date: { lt: targetDate } },
      orderBy: { date: 'desc' },
    }),
  ]);

  const historyDates = [targetDate, addDays(targetDate, -1), addDays(targetDate, -2)];
  const historyRows = await prisma.titanDay.findMany({
    where: { date: { in: historyDates } },
  });
  const historyMap = historyRows.reduce<Record<string, ReturnType<typeof mapRow>>>(
    (acc, row) => {
      acc[row.date] = mapRow(row);
      return acc;
    },
    {},
  );

  const mappedDay = dayRow ? mapRow(dayRow) : createEmptyDay(targetDate);
  const lastWeight = lastWeightRow?.weight ?? 0;
  const previousWeight = previousWeightRow?.weight ?? 0;
  const weightForBmr = mappedDay.weight > 0 ? mappedDay.weight : lastWeight;

  const bmr = computeBmr(weightForBmr);
  const net = computeNet(mappedDay.calIn, mappedDay.calOut);
  const titanScoreComputed = computeTitanScore(mappedDay);
  const flagsComputed = buildFlags(mappedDay, lastWeight, previousWeight, historyMap);

  const { start, end } = getMonthRange(targetDate);
  const monthRows = await prisma.titanDay.findMany({
    where: { date: { gte: start, lte: end } },
    orderBy: { date: 'asc' },
  });
  const scoreMap = monthRows.reduce<Record<string, number>>((acc, row) => {
    acc[row.date] = row.titanScore ?? 0;
    return acc;
  }, {});
  const monthDates: { date: string; score: number }[] = [];
  let cursor = start;
  while (cursor <= end) {
    monthDates.push({ date: cursor, score: scoreMap[cursor] ?? 0 });
    cursor = addDays(cursor, 1);
  }

  const history = await prisma.titanDay.findMany({
    orderBy: { date: 'desc' },
    take: 30,
  });

  return {
    success: true,
    meta: {
      targetDate,
      todayStr,
      daysLeft: diffDays(todayStr, TARGET_DATE),
      season: todayStr < SEASON_START ? 'PRE-SEASON' : 'SEASON',
      fastStartMs: fastState ? Number(fastState.value) : null,
      nowIso: getNowIso(),
    },
    user: {
      age: getAgeFromDob('1997-05-14'),
      lastWeight,
    },
    dayLog: {
      ...mappedDay,
      bmr,
      net,
      titanScoreComputed,
      flagsComputed,
    },
    calendar: monthDates,
    history: history.map((row) => {
      const mapped = mapRow(row);
      return {
        ...mapped,
        net: computeNet(mapped.calIn, mapped.calOut),
        score: mapped.titanScore,
      };
    }),
  };
}
